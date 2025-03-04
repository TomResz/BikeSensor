import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogService, DialogRef } from '@ngneat/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

interface GaugeOptionsDialogData {
  minValue: number;
  maxValue: number;
}

@Component({
  selector: 'app-gauge-options-dialog',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gauge-options-dialog.component.html',
  styleUrl: './gauge-options-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaugeOptionsDialogComponent {
  ref: DialogRef<GaugeOptionsDialogData, boolean> = inject(DialogRef);
  private fb = inject(FormBuilder);

  gaugeForm: FormGroup = this.fb.group(
    {
      minValue: [this.ref.data.minValue, [Validators.required]],
      maxValue: [this.ref.data.maxValue, [Validators.required]],
    },
    {
      validators: this.maxGreaterThanMinValidator,
    }
  );

  private maxGreaterThanMinValidator(form: FormGroup) {
    const min = this.minValue?.value;
    const max = this.maxValue?.value;
    return max > min ? null : { maxLessThanMin: true };
  }

  onSubmit() {
    if (this.gaugeForm.valid) {
      this.ref.data.minValue = this.minValue?.value;
      this.ref.data.maxValue = this.maxValue?.value;
      this.ref.close(true);
    }
  }

  get minValue() {
    return this.gaugeForm.get('minValue');
  }
  get maxValue() {
    return this.gaugeForm.get('maxValue');
  }

  onCancel() {
    this.ref.close(false);
  }
}
