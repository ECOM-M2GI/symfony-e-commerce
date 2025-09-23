import { AbstractControl, FormGroup } from "@angular/forms";

export class FormHandler<T extends { [K in keyof T]: AbstractControl<any, any, any>; }> {

    formName: string;
    formGroup: FormGroup<T>;
    formEl: HTMLFormElement;
    fieldNames: { [K in keyof T]?: string };

    constructor(formName: string, formGroup: FormGroup, formEl: HTMLFormElement) {
        this.formName = formName;
        this.formGroup = formGroup;
        this.fieldNames = Object.keys(this.formGroup.controls).reduce((acc, key) => {
            acc[key as keyof T] = `${this.formName}_${key}`;
            return acc;
        }, {} as { [K in keyof T]?: string })
        this.formEl = formEl;
    }

    static getFieldNames<T>(formName: string, formGroup: FormGroup): { [K in keyof T]: string } {
        return Object.keys(formGroup.controls).reduce((acc, key) => {
            acc[key as keyof T] = `${formName}_${key}`;
            return acc;
        }, {} as { [K in keyof T]: string })
    }

    handleErrors(errors: Record<string, string[]>, formEl?: HTMLFormElement) {
        for (const error in errors) {
            if (Object.keys(this.fieldNames).includes(error)) {
                this.formGroup.get(String(error))?.setErrors({ serverError: errors[error] });
                this.displayError(error as keyof T);
            } else {
                this.formGroup.setErrors({ nonFieldError: errors[error] });
                this.displayError('nonFieldError');
            }
        }
    }

    clearsErrors() {
        const errorMessagesEl = document.querySelectorAll(`.${this.formName}_error_message`);
        errorMessagesEl.forEach((errorMsgEl) => errorMsgEl.remove());
    }

    displayError(fieldName: keyof T | 'nonFieldError') {
        let fieldEl: HTMLElement | null = null;
        const errorEl = document.createElement('p');
        errorEl.className = 'text-red-500 text-sm mt-1';
        errorEl.classList.add(`${this.formName}_error_message`);
        if (fieldName === 'nonFieldError') {
            fieldEl = this.formEl.querySelector(`*:first-child`);
            errorEl.textContent = this.formGroup.getError('nonFieldError');
        }
        else {
            fieldEl = this.formEl.querySelector(`#${this.formName}_${String(fieldName)}`);
            errorEl.textContent = this.formGroup.get(String(fieldName))?.getError('serverError');
        }
        fieldEl?.insertAdjacentElement('beforebegin', errorEl);
    }
};

