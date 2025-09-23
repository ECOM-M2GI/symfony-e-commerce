import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css'
})
export class Loading {
  isLoading = input.required<boolean>();
  size = input<'default' | 'small'>('default');
}
