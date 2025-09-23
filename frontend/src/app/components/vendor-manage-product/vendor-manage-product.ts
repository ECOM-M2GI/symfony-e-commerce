import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormHandler } from '@app/common/forms-handle';

import {
  ProductModelRequest,
  Category,
  Condition,
  DeliveryMode,
  ProductModel,
} from '@app/models/product-model';
import { NotificationService } from '@app/services/notification-service.service';
import { Loading } from '../loading/loading';
import { FormControlsOf } from '@app/models/form-model';

@Component({
  selector: 'app-vendor-manage-product',
  imports: [ReactiveFormsModule, CommonModule, Loading],
  templateUrl: './vendor-manage-product.html',
  styleUrl: './vendor-manage-product.css',
})
export class VendorManageProduct implements OnInit {
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  isLoading = input.required<boolean>();
  submitForm = output<ProductModelRequest>();
  cancelForm = output<void>();

  submitLabel = input<string>('Ajouter le produit');
  submitClass = input<string>('btn-warning');

  // Form for adding new product
  productForm: FormGroup<FormControlsOf<Partial<ProductModelRequest>>>;
  fieldNames = signal<{ [K in keyof ProductModelRequest]: string } | undefined>(undefined);
  selectedImage = signal<File | undefined | null>(undefined);
  imagePreview = signal<string | null>(null);

  editProductData = input<ProductModel>();

  constructor() {
    this.productForm = this.fb.nonNullable.group<FormControlsOf<Partial<ProductModelRequest>>>({
      name: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      description: this.fb.control('', { nonNullable: true }),
      price: this.fb.control(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0.01)],
      }),
      stock_quantity: this.fb.control(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      shipping_fee: this.fb.control(0, { nonNullable: true, validators: [Validators.min(0)] }),
      delivery_mode: this.fb.control('by_mail', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      condition: this.fb.control('new', { nonNullable: true, validators: [Validators.required] }),
      is_active: this.fb.control(true, { nonNullable: true }),
      category: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    });

    if (this.editProductData()) {
      this.fieldNames.set(
        FormHandler.getFieldNames<ProductModelRequest>('edit-product-form', this.productForm)
      );
    }
    {
      this.fieldNames.set(
        FormHandler.getFieldNames<ProductModelRequest>('add-product-form', this.productForm)
      );
    }
  }

  ngOnInit(): void {
    if (this.editProductData()) {
      for (const key in this.productForm?.controls) {
        if (this.editProductData()![key as keyof ProductModel] !== undefined) {
          this.productForm!.controls[key as keyof ProductModelRequest]!.setValue(
            this.editProductData()![key as keyof ProductModel] as any
          );
        }
      }

      const imageUrl = this.editProductData()!.image_url;
      if (imageUrl) {
        this.imagePreview.set(imageUrl);
        this.selectedImage.set(null); // No new image selected yet
      }
    }
    const shippingCtrl = this.productForm.get('shipping_fee')!;
    const deliveryCtrl = this.productForm.get('delivery_mode')!;

    const applyMode = (mode: string) => {
      const isHand = mode !== 'by_mail';
      if (isHand) {
        if (!shippingCtrl.disabled) shippingCtrl.disable({ emitEvent: false });
        shippingCtrl.setValue(0, { emitEvent: false });
      } else {
        if (shippingCtrl.disabled) shippingCtrl.enable({ emitEvent: false });
      }
    };

    applyMode(deliveryCtrl.value as string);
    deliveryCtrl.valueChanges.subscribe((m) => applyMode(m as string));
  }

  onSubmitProduct() {
    if (this.productForm.valid && this.selectedImage() !== undefined && this.productForm.dirty) {
      const formValue = this.productForm.getRawValue();
      const productRequest: ProductModelRequest = {
        id: 0, // Will be set by backend
        name: formValue.name!,
        description: formValue.description!,
        price: formValue.price!,
        stock_quantity: formValue.stock_quantity!,
        is_active: formValue.is_active!,
        shipping_fee: formValue.shipping_fee!,
        delivery_mode: formValue.delivery_mode!,
        condition: formValue.condition!,
        category: formValue.category!,
        image: this.selectedImage()!,
      };

      this.submitForm.emit(productRequest);
    } else {
      this.notify.showError(
        'Veuillez remplir tous les champs obligatoires et sélectionner une image'
      );
    }
  }

  resetForm() {
    this.productForm.reset();
    this.selectedImage.set(null);
    this.imagePreview.set(null);
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedImage.set(file);
      this.productForm.markAsDirty();

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  protected readonly Category = Category;
  protected readonly Object = Object;
  protected readonly Condition = Condition;
  protected readonly DeliveryMode = DeliveryMode;
}
