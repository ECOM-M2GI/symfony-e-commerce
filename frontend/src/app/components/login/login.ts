import { Component, ElementRef, viewChild, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormHandler } from '@app/common/forms-handle';
import { LoginForm, UserLoginRequestModel } from '@app/models/user-model';
import { UserService } from '@app/services/user-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  private userService = inject(UserService);
  private router = inject(Router);


  redirectUrl: string | null = null

  formEl = viewChild.required<ElementRef>('form');
  formHandler!: FormHandler<LoginForm>;
  fieldNames!: { [K in keyof LoginForm]?: string };

  loginForm = new FormGroup<LoginForm>({
    username: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });

  ngOnInit() {
    this.redirectUrl = new URL(window.location.href).searchParams.get('returnUrl');

    this.formHandler = new FormHandler<LoginForm>('login', this.loginForm, this.formEl().nativeElement);
    this.fieldNames = this.formHandler.fieldNames;
  }

  login() {
    this.userService.login(this.loginForm.controls).subscribe({
      next: (res) => {
        this.formHandler.clearsErrors();
        if (res.user_id && this.redirectUrl) {
          this.router.navigate([this.redirectUrl]);
        } else {
          this.router.navigate(["/"]);
        }
      },
      error: (err) => {
        this.formHandler.clearsErrors();
        this.formHandler.handleErrors(err.error);
      }
    })
  }
}
