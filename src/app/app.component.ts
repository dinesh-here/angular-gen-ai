import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, ElementRef, model, Signal, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { pipeline, TextClassificationOutput, TextClassificationPipeline } from '@xenova/transformers';
import {fromEvent, debounceTime } from 'rxjs';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  title = 'angular-gen-ai';
  isModalLoading = signal(true);
  isCalc = signal(false);
  reviewText = model('I love angular !');
  textClassificationPipeline: TextClassificationPipeline;
  @ViewChild("reviewEle", {static: false}) reviewEle: ElementRef;
  reviewValue: any;
  constructor() {
    this.initGenAIModal();
  }

  ngAfterViewInit(): void {
  }

  private async initGenAIModal() {
    const classifier = await pipeline('sentiment-analysis');
    this.textClassificationPipeline = classifier;
    this.isModalLoading.update(value => false);
    const output = await classifier('I love transformers!');
    this.reviewValue = output[0];
    setTimeout(() => {
      this.addReviewListner();
    })
    console.log(output);
  }

  private addReviewListner() {
    fromEvent(this.reviewEle.nativeElement, 'keyup').pipe(debounceTime(2000)).subscribe({
      next: (val) => {
        this.isCalc.update(value => true);
        console.log(this.isCalc())
        this.textClassificationPipeline(this.reviewText()).then((resp) => {
          this.reviewValue = resp[0];
          setTimeout(() => {
            this.isCalc.update(value => false);
          })
        });
      }
    })
  }
}
