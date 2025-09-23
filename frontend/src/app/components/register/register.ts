import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, viewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormHandler } from '@app/common/forms-handle';
import { RegisterForm } from '@app/models/user-model';
import { UserService } from '@app/services/user-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private userService = inject(UserService);
  private router = inject(Router);


  redirectUrl: string | null = null

  formEl = viewChild.required<ElementRef>('form');
  formHandler!: FormHandler<RegisterForm>;
  fieldNames!: { [K in keyof RegisterForm]?: string };

  registerForm = new FormGroup<RegisterForm>({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password_confirm: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true }),
    first_name: new FormControl('', { nonNullable: true }),
    last_name: new FormControl('', { nonNullable: true }),
  });

  ngOnInit() {
    this.redirectUrl = new URL(window.location.href).searchParams.get('returnUrl');

    this.formHandler = new FormHandler<RegisterForm>('register', this.registerForm, this.formEl().nativeElement);
    this.fieldNames = this.formHandler.fieldNames;
  }

  register() {
    this.userService.register(this.registerForm.controls).subscribe({
      next: (res) => {
        this.formHandler.clearsErrors();
        if (res.user_id) {
          if (this.redirectUrl) {
            this.router.navigate([this.redirectUrl]);
          } else {
            this.router.navigate(["/"]);
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        this.formHandler.clearsErrors();
        this.formHandler.handleErrors(err.error);
      }
    });
  }
}
