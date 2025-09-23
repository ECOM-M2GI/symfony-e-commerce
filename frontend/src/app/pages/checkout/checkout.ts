import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@app/services/user-service';

@Component({
  selector: 'app-checkout',
  imports: [],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})

export class Checkout {
  userEmail = signal<string | undefined>(undefined);
  constructor(private userService: UserService, private router: Router) { };

  ngOnInit(): void {
    this.userService.getOwnProfile().subscribe({
      next: (user) => {
        if (user.email !== "") {
          this.userEmail.set(user.email)
        } else {
          this.userEmail.set("");
        }
      }
    })
  }

  redirect(): void {
    this.router.navigate(['/']);
  }
}
