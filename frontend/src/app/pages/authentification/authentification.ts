import { Component } from '@angular/core';
import { Register } from "@app/components/register/register";
import { Login } from "@app/components/login/login";
import { UserService } from '@app/services/user-service';

@Component({
  selector: 'app-authentification',
  imports: [Register, Login],
  templateUrl: './authentification.html',
  styleUrl: './authentification.css'
})
export class Authentification {
}
