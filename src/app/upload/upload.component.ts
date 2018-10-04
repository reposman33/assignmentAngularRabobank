import { Form } from '@angular/forms';
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { ModalDirective } from 'angular-bootstrap-md/modals/modal.directive';
import { Router } from '@angular/router';

import { UploadService } from '../Shared/upload.service';
import { I18nService } from '../I18n/i18n.service';
import { UploadLanguagepack } from './upload.languagepack';

@Component({
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})

export class UploadComponent implements AfterViewInit, OnInit {
  @ViewChild('uploadPhotoModal') uploadPhotoModal: ModalDirective;

  fileToUpload: File;
  fileReader: FileReader;
  img = {src: '', width: 160, alt: ''};
  classification: string;
  useClass = {fadeInFadeOut:false};
  i18nContent = {};

  constructor(private uploadService: UploadService,
              private router: Router,
              private i18nService: I18nService) {
    this.i18nService.initialize(UploadLanguagepack);
    this.i18nService.languageSelector.subscribe(language => this.initializeLanguage(language));
  }

  ngOnInit() {
    this.initializeLanguage();
  }

  initializeLanguage(language?) {
    this.i18nContent['modal_upload_title'] = this.i18nService.getKey('modal_upload_title', language);
    this.i18nContent['modal_upload_input_prepend_text'] = this.i18nService.getKey('modal_upload_input_prepend_text', language);
    this.i18nContent['modal_upload_button_upload_text'] = this.i18nService.getKey('modal_upload_button_upload_text', language);
  }

    ngAfterViewInit() {
    this.uploadPhotoModal.show();
  }

  uploadFile(form: Form) {
    if (!this.fileToUpload) {
      return;
    }

    this.classification = 'Classifying...';
    this.useClass.fadeInFadeOut = true;
    this.uploadService.uploadFile(this.fileToUpload, this.fileToUpload.name)
      .subscribe(response => {
        setTimeout(() => {
          this.classification = response['prediction'].join(',');
          this.useClass.fadeInFadeOut = false;
        },1000)},
        error => {
          console.log(error);
          this.classification = 'ERROR uploading file';
        });
  }

  fileSelected(uploadFiles) {
    this.fileToUpload = uploadFiles[0];
    // display the selected photo below video
    this.fileReader = new FileReader();
    this.fileReader.readAsDataURL(this.fileToUpload);
    this.fileReader.onload = (e) => {
      this.img.src = this.fileReader.result;
      this.img.alt = this.fileToUpload.name;
    };
  }

  navigateTo(route) {
    this.router.navigate([route]);
  }
}
