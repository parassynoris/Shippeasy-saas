import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-autofill',
  template: ''
})
export class AutofillComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // const rememberedUsername = localStorage.getItem('rememberedUsername');
    // const rememberedPassword = localStorage.getItem('rememberedPassword');

    // if (rememberedUsername && rememberedPassword) {
    //   // Automatically populate the login fields
    //   // (Assuming you have access to the login form)
    //   const loginForm = document.forms[0]; // Assuming it's the first form on the page
    //   loginForm.username.value = rememberedUsername;
    //   loginForm.password.value = rememberedPassword;

    //   // You may need to trigger change detection here if you're using Angular forms
    // }

    // // Redirect to the login page
    // this.router.navigateByUrl('/login');
  }

}
