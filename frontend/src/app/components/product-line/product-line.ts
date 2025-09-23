import { Component, input } from '@angular/core';
import { ProductModel } from '@app/models/product-model';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-product-line',
  imports: [RouterLink],
  templateUrl: './product-line.html',
  styleUrl: './product-line.css'
})
export class ProductLine {
  product = input.required<ProductModel>();
}
