// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, set} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"
//import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnrjkM59f5C-UrvAi76IKi5RNODLWU_RY",
  authDomain: "wordsandbytes-f2d23.firebaseapp.com",
  projectId: "wordsandbytes-f2d23",
  storageBucket: "wordsandbytes-f2d23.appspot.com",
  messagingSenderId: "139616410598",
  appId: "1:139616410598:web:5c5e3eef8c58710bfb1427",
  measurementId: "G-NK03NKXBP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
//const analytics = getAnalytics(app);
$(document).ready(function(){

  // jQuery methods go here...
  $("#subscribebtn").click(function(e) {
    e.preventDefault();

    const emailData = {
      "email": $("#semail").val()
    };

    $(".alert").removeClass("d-none");
    $(this).parent().hide();

    // Create a new email reference with an auto-generated id
    const emailListRef = ref(database, 'emails');
    
    const newEmailRef = push(emailListRef)

    set(newEmailRef, emailData)
    .catch((error) => {
      console.log("set error", error);
    });

   

    console.log(emailData, emailListRef, newEmailRef) ;

    
    



    // $(this).hide(); 
  });

});