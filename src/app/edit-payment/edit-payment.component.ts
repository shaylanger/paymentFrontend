import { Component, inject } from '@angular/core';
import { 
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Payment } from '../payment.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-payment',
  imports: [MatDialogContent, MatFormFieldModule, MatDialogActions, MatIconModule, CommonModule, MatButtonModule, MatDialogTitle, MatSelectModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './edit-payment.component.html',
  styleUrl: './edit-payment.component.scss'
})
export class EditPaymentComponent {
readonly dialogRef = inject(MatDialogRef<EditPaymentComponent>);
  readonly data = inject<{payment: Payment}>(MAT_DIALOG_DATA);
  fileName: string
  file: any
  showError = false;

   public form: FormGroup = new FormGroup({
    due_date: new FormControl(this.data.payment.payee_due_date, Validators.required),
    due_amount: new FormControl(this.data.payment.due_amount, Validators.required),
    status: new FormControl(this.data.payment.payee_payment_status),
  });

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if(this.form.controls['status'].value === 'completed' && !this.file) {
      this.showError = true;
      return;
    }
    this.dialogRef.close({
      due_date: this.form.controls['due_date'].value,
      due_amount: this.form.controls['due_amount'].value,
      status: this.form.controls['status'].value,
      file: this.file,
    });
  }

  onFileSelected(event: any) { 
    this.showError = false;
      const file:File = event.target.files[0];
      if (file) {
          this.fileName = file.name;
          this.file = file;
      }
    }
}
