import { Component, signal, inject, OnInit, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductsService } from '@app/services/products-service';
import {
  ProductModelRequest,
  ProductModel,
  Category,
  Condition,
  DeliveryMode,
  PatchProductRequestModel,
} from '@app/models/product-model';
import { VendorManageProduct } from '@app/components/vendor-manage-product/vendor-manage-product';
import { VendorProductCardSkeleton } from '@app/components/vendor-product-card-skeleton/vendor-product-card-skeleton';
import { NotificationService } from '@app/services/notification-service.service';

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VendorManageProduct, VendorProductCardSkeleton],
  templateUrl: './vendor.html',
  styleUrl: './vendor.css',
})
export class VendorComponent implements OnInit {
  private productsService = inject(ProductsService);
  private notify = inject(NotificationService);

  addProductComponent = viewChild<VendorManageProduct>('addProduct');
  editProductComponent = viewChild<VendorManageProduct>('editProduct');
  editingProduct = signal<ProductModel | undefined>(undefined);

  // State management
  activeTab = signal<'products' | 'add-product' | 'edit-product'>('products');
  userProducts = signal<ProductModel[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadUserProducts();
  }

  loadUserProducts() {
    this.isLoading.set(true);
    this.productsService.myProducts().subscribe({
      next: (products) => {
        this.userProducts.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notify.showError('Erreur lors du chargement des produits');
        this.isLoading.set(false);
        console.error('Error loading products:', error);
      },
    });
  }

  onSubmitAddProduct(productRequest: ProductModelRequest) {
    this.isLoading.set(true);
    this.productsService.addProduct(productRequest).subscribe({
      next: () => {
        this.addProductComponent()?.resetForm();
        this.loadUserProducts();
        this.notify.showSuccess('Produit ajouté avec succès!');
        setTimeout(() => this.notify.clear(), 5000);
      },
      error: (error) => {
        this.notify.showError("Erreur lors de l'ajout du produit");
        this.isLoading.set(false);
        console.error('Error adding product:', error);
      },
    });
  }

  cancelAdd() {
    this.addProductComponent()?.resetForm();
  }

  triggerEdit(product: ProductModel) {
    this.editProductComponent()?.resetForm();
    this.editingProduct.set(product);
    this.setActiveTab('edit-product');
  }

  onSubmitEditingProduct(productRequest: PatchProductRequestModel) {
    this.isLoading.set(true);
    this.productsService
      .patchProduct(this.editingProduct()!.id, productRequest, this.editingProduct()!)
      .subscribe({
        next: () => {
          this.editProductComponent()?.resetForm();
          this.loadUserProducts();
          this.editingProduct.set(undefined);
          this.setActiveTab('products');
          this.notify.showSuccess('Produit modifié avec succès!');
          setTimeout(() => this.notify.clear(), 5000);
        },
        error: (error) => {
          this.notify.showError('Erreur lors de la modification du produit');
          this.isLoading.set(false);
          this.editingProduct.set(undefined);
          console.error('Error adding product:', error);
        },
      });
  }

  cancelEdit() {
    this.editProductComponent()?.resetForm();
    this.editingProduct.set(undefined);
    this.setActiveTab('products');
  }

  deleteProduct(productId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.isLoading.set(true);
      this.productsService.deleteProduct(productId.toString()).subscribe({
        next: () => {
          this.loadUserProducts();
          this.notify.showSuccess('Produit supprimé avec succès!');
          setTimeout(() => this.notify.clear(), 5000);
        },
        error: (error) => {
          this.notify.showError('Erreur lors de la suppression du produit');
          this.isLoading.set(false);
          console.error('Error deleting product:', error);
        },
      });
    }
  }

  toggleProductStatus(product: ProductModel) {
    const updatedProduct = { ...product, is_active: !product.is_active };
    this.productsService
      .patchProduct(product.id.toString(), { is_active: !product.is_active } as any)
      .subscribe({
        next: () => {
          this.loadUserProducts();
          this.successMessage.set(
            `Produit ${updatedProduct.is_active ? 'activé' : 'désactivé'} avec succès!`
          );
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (error) => {
          this.errorMessage.set('Erreur lors de la mise à jour du produit');
          console.error('Error updating product status:', error);
        },
      });
  }

  setActiveTab(tab: 'products' | 'add-product' | 'edit-product') {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  clearMessages() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected readonly Category = Category;
  protected readonly Object = Object;
  protected readonly Condition = Condition;
  protected readonly DeliveryMode = DeliveryMode;
}
