
https://www.artima.com/articles/on-the-tension-between-object-oriented-and-generic-programming-in-c

https://itanium-cxx-abi.github.io/cxx-abi/abi.html#vtable

# Introduction to RTTI and variadic types in C++

<div class="meta mb-3"><span class="date">Published 3 months ago</span><span class="time">5 min read</span><span class="comment"><a href="#">4 comments</a></span></div>

<figure align="center">
  <img class="img-fluid" src="/blog/01/apples_and_oranges2.jpg" alt="This images depicts a bunch of apples and oranges grouped togheter" />
  <figcaption class="mt-2 text-center image-caption">Image: The two types of fruit.</figcaption>
</figure>

If you are used to dynamicly typed language like Python and Javascript, you must have found convinient that variables can store objects of any type.

We will look at one possible way to achieve similar functionality in C++. The solution I am going to present is simple but it requires knowledge of two more genreal C++ concepts:

* The usage of  ```type_info``` class and ```typeid()``` operator to retrieve the runtime type information of an object.
* The usage of the ***type erasure*** technique allowing to unify a set of classes that don't derive from a common base.


## 1. What is ```type_info``` class

In C++, ```type_info``` is a class provided by the runtime type identification (RTTI) mechanism. It's primarily used to expose information about types at runtime, particularly for polymorphic types (those that involve inheritance and virtual functions).

You can encounter ```type_info``` objects invoking ```typeid()``` operator, which identifies the type of the provided expression and returns a static reference to the corresponding ```type_info``` object (```type_info``` doesn't have public constructors). This allows you for example to determine the type of the derived object from a pointer to its base, at runtime, in your program.

The details of the ```type_info``` class are implementation-defined, still for polymorphic types compilers access object's metadata from the virtual tables, and adhere to the aplication binary interface (ABI) when returning the name of the class, I will provide a look into implementation of virtual tables more indepth in a later post.

Here's a list of the most important ```type_info```'s methods which make it usefull for type identification.

1. **Equality**: The ```type_info``` class defines an equivalence relation and equality, each ```type_info``` object corresponds to a ***specific type***, two type_info objects can be comapred using ```operator==``` and ```operator!=``` to determine if two types are the same. 

2. **Ordering**: The ```type_info``` class defines an ordering relation, that is you can compare two ```type_info``` obejcts using ```operator<```. This is usefull, for instance when ```type_info``` objects are used as keys into an ordered conainer such as ```std::map<type_info*, ValueType>``` or ```std::set<type_info*>```

3. **Name Retrieval**: The ```name()``` member function returns a C-style string representing the name of the type as specified by the ABI.

### Example ###

Here’s a simple example to demonstrate the use of ```type_info```:

```c++
#include <iostream>
#include <typeinfo>

class Base {
    virtual void func() {}
};

class Derived : public Base {};

int main() {
    Base* b = new Derived();
    
    const std::type_info& ti = typeid(*b);
    std::cout << "The type is: " << ti.name() << std::endl;

    delete b;
    return 0;
}
```

***Outputs:***

```md
The type is: class Derived
```

In this example, ```typeid(*b)``` retrieves the ```type_info``` for the actual object that ```b``` points to, which is of type ```Derived```, even though ```b``` is a pointer to ```Base```. The ```name()``` function outputs the type name.


## 2. Introduction to type erasure

Type erasure is a technique commonly used in scenarious where you want to store objects of different types in a uniform way, often in data structures like containers or for implementing interfaces between unrelated classes. The main idea is to provide a common interface, while at the same time hiding the specific types of the objects being handled.

Recall that Dave Abrahams and Aleksey Gurtovoy defined type erasure as "the process of turning a wide variety of types with a common interface into one type with that same interface." Now imagine you are designing a set of C++ classes with a common interface from scratch, and you want to be able to treat them as one type with that same interface. Talk about OO programming 101: you would derive your classes from a common base class. And that's exactly the idea behind implementing type erasure in C++. We would like the classes whose type we want to erase to be derived from a common base class. But since these classes already exist, and we must work non-intrusively, we can do this only indirectly, by first placing a wrapper class template around the existing classes. The wrapper class template is under our control, and therefore, we can derive it from a common base class.

Type errasure is a technique commonly used to unify (via an induced hierarchy) a set of unrelated classes with the goal to store the resulting objects in an uniform way, often in data structures like containers or for implementing interfaces between them.

Let's start with an ilustrattive example. Imagine that we have two classes ```Circle``` and ```Square``` that both implement a member function called ```draw()```. Note that the classes are unrelated to eachother via inheritance and further we don't want to modify how the classes are implemented.

```c++
class Circle {
public:
    void draw() const {
        // Implementation for drawing a circle
        std::cout << "circle" << std::endl;
    }
};

class Square {
public:
    void draw() const {
        // Implementation for drawing a square
        std::cout << "square" << std::endl;
    }
};
```

We would like to store objects of both types in an array, but the problems is, as we already stated, they don't derive from a common base.

The basic idea behind type erasure is to wrap the classes ```Circle``` and ```Square``` in a template wrapper that itself derives from an abstract base class in place of our classes. The original type is wrapped into another type which presents a common interface to us through a base class which can be used by us.

In our example ```Derived<T>``` is the wrapper class which will hold a ***value of type ```T```*** and inherit from a base class ```Base```. This allows us to store our wrapped objects of type ```Derived<Circle>``` and ```Derived<Square>``` as objects of ```Base*```. This accomplishes our first goal, we can now store if we wish the wrapped objects in an array of type ```Base*[]```.

However this solution is incomplete, we don't have any way to call the ```draw()``` member function when these wrapped objects are stored as ```Base*```. Furthermore we would not want to create the wrappers ourselves. 

The first piece of the puzzle is to let the class ```Base``` define an abstract function ```draw()``` as part of its interface, and each wraper provide an override of the function ```draw()``` that forwards the call to the stored value's ```T::draw()```. This allows us to call ```draw()``` on the objects stored as ```Base*```

Further we would like to add a handle class AnyShape

```c++
// Wrapper for the classes Circle and Square
template<typename T>
struct Derived : Base {
    Derived(T value) : value(value) {}
    void draw() const override {
        value.draw(); // forwards the call
    }
    T value;
};

// Abstract base class
struct Base {
    virtual ~Base() = default;
    virtual void draw() const = 0;
};
```



### Example ###

Here is the complete example of the above

```c++
#include <memory>
#include <iostream>

class Circle {
public:
    void draw() const {
        // Implementation for drawing a circle
        std::cout << "circle" << std::endl;
    }
};

class Square {
public:
    void draw() const {
        // Implementation for drawing a square
        std::cout << "square" << std::endl;
    }
};


class AnyShape {
public:
    template<typename T>
    AnyShape(T value) : ptr(std::make_shared<Derived<T>>(value)) {}

    void draw() const {
        ptr->draw();
    }

private:
    
    struct Base {
        virtual ~Base() = default;
        virtual void draw() const = 0;
    };

    template<typename T>
    struct Derived : Base {
        Derived(T value) : value(value) {}
        void draw() const override {
            value.draw();
        }
        T value;
    };

    std::shared_ptr<Base> ptr;
};

int main() {
    AnyShape shape1 = Circle();
    AnyShape shape2 = Square();

    shape1.draw(); // Calls Circle's draw
    shape2.draw(); // Calls Square's draw
}
```

***Outputs:***

```md
circle
square
```

Essentialy we wraped an object of type ```T``` into a ```AnyShape::Derived<T>``` wrapper and gave it a common abstract base ```AnyShape::Base```
Notice that storing a value ```T* ptr``` in a container of type ```Derived<T> : Base``` that iherits from ```Base``` and when itself stored as ```Base * ptr = new Derived<T>()```, removes the known to us information about ```T``` from ```*ptr```.

Maybe you can already see where this is going, if we want to get the type of ```*ptr``` back, we need ***RTTI***  and the ```type_info``` class.


The ```boost::any``` class just stores any value in it. To achieve this, it uses the ***type erasure*** technique (close to what Java or C# does with all types). To use this library you do not really need to know its internal implementation in detail, but here's a quick glance at the type erasure technique for the curious.

On the assignment of some variable of type ```T```, ```Boost.Any``` instantiates a ```holder<T>``` type that may store a value of the specified type ```T``` and is derived from some base-type ```placeholder```:
```c++
template<typename ValueType>
struct holder : public placeholder {
  
  virtual const std::type_info& type() const {
    return typeid(ValueType);
  }
  
  ValueType held;
};
```
A ```placeholder``` type has virtual functions for getting ```std::type_info``` of a stored type ```T``` and for cloning a stored type:

```c++
struct placeholder {
  virtual ~placeholder() {}
  virtual const std::type_info& type() const = 0;
};
```
```boost::any``` stores ```ptr``` a pointer to placeholder. When ```any_cast<T>()``` is used, ```boost::any``` checks that calling ```ptr->type()``` gives ```std::type_info``` equal to ```typeid(T)``` and returns ```static_cast<holder<T>*>(ptr)->held```.

Such flexibility never comes without any cost. Copy constructing, value constructing, copy
assigning, and assigning values to instances of boost::any do dynamic memory
allocation; all the type casts do **RTTI** checks; ```boost::any``` uses virtual functions a lot. If you are keen on performance, the next recipe will give you an idea of how to achieve almost the same results without dynamic allocations and RTTI usage.

