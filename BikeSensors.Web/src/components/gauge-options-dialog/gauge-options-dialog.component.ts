import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
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
  readonly maximumValue: number = 1000;

  gaugeForm: FormGroup = this.fb.group(
    {
      minValue: [
        this.ref.data?.minValue ?? 0,
        [Validators.required, Validators.min(0)],
      ],
      maxValue: [
        this.ref.data?.maxValue ?? 100,
        [Validators.required, Validators.max(this.maximumValue)],
      ],
    },
    { validators: this.maxGreaterThanMinValidator }
  );

  private maxGreaterThanMinValidator(form: FormGroup) {
    const min = form.get('minValue')?.value;
    const max = form.get('maxValue')?.value;
    return max > min ? null : { maxLessThanMin: true };
  }

  onSubmit() {
    if (this.gaugeForm.valid) {
      const { minValue, maxValue } = this.gaugeForm.value;
      this.ref.data.minValue = minValue;
      this.ref.data.maxValue = maxValue;
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

  restrictMaxValue(event: Event) {
    const input = event.target as HTMLInputElement;
    const maxAllowed = this.maximumValue;

    if (input.valueAsNumber > maxAllowed) {
      input.value = maxAllowed.toString();
      this.maxValue?.setValue(maxAllowed); 
    }
  }

  restrictMinValue(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.valueAsNumber < 0) {
      input.value = '0';
      this.minValue?.setValue(0);
    }
  }
}
