# Leihlo recording and translation script

This file is generated from `public/strings.json` by `npm run recording-script`. Edit the JSON, not this file.

How to use it:

1. Write the Sepedi text on the blank line under each English sentence.
2. Copy each Sepedi text into the `sepedi` field of the same key in `public/strings.json`.
3. Record each clip in Part 1 as a short MP3 and save it as the file name shown, inside `public/audio/`.
4. Run `npm run build` so the new clips are bundled for offline use.

Recording tips: one speaker, a quiet room, the phone held about 20 cm away, a calm and slow voice. Mono MP3 at 64 kbps is enough. Keep each clip under 5 seconds.

## Part 1: clips to record (23 clips)

### 1. `welcome_intro`

File: `public/audio/welcome_intro.mp3`

English: Leihlo helps you check your coffee leaves.

Sepedi: ______________________________________________

### 2. `consent_stored`

File: `public/audio/consent_stored.mp3`

English: Your name, photos and results are saved on this phone.

Sepedi: ______________________________________________

### 3. `consent_who_sees`

File: `public/audio/consent_who_sees.mp3`

English: Your reports go only to your extension officer.

Sepedi: ______________________________________________

### 4. `consent_delete`

File: `public/audio/consent_delete.mp3`

English: You can delete all your data at any time in My reports.

Sepedi: ______________________________________________

### 5. `setup_prompt`

File: `public/audio/setup_prompt.mp3`

English: Type your name, member number and plot name.

Sepedi: ______________________________________________

### 6. `zone_prompt`

File: `public/audio/zone_prompt.mp3`

English: Which part of the plot are you checking?

Sepedi: ______________________________________________

### 7. `leaf_prompt_1`

File: `public/audio/leaf_prompt_1.mp3`

English: Take a photo of the first leaf.

Sepedi: ______________________________________________

### 8. `leaf_prompt_2`

File: `public/audio/leaf_prompt_2.mp3`

English: Take a photo of the second leaf.

Sepedi: ______________________________________________

### 9. `leaf_prompt_3`

File: `public/audio/leaf_prompt_3.mp3`

English: Take a photo of the third leaf.

Sepedi: ______________________________________________

### 10. `photo_tip`

File: `public/audio/photo_tip.mp3`

English: Hold one leaf flat in daylight, close to the camera.

Sepedi: ______________________________________________

### 11. `result_healthy`

File: `public/audio/result_healthy.mp3`

English: This leaf looks healthy.

Sepedi: ______________________________________________

### 12. `result_leaf_rust`

File: `public/audio/result_leaf_rust.mp3`

English: This leaf may have coffee leaf rust.

Sepedi: ______________________________________________

### 13. `result_leaf_miner`

File: `public/audio/result_leaf_miner.mp3`

English: This leaf may have leaf miner damage.

Sepedi: ______________________________________________

### 14. `result_not_sure`

File: `public/audio/result_not_sure.mp3`

English: Not sure, ask the extension officer.

Sepedi: ______________________________________________

### 15. `advice_healthy`

File: `public/audio/advice_healthy.mp3`

English: Keep checking your trees every week.

Sepedi: ______________________________________________

### 16. `advice_leaf_rust`

File: `public/audio/advice_leaf_rust.mp3`

English: Remove and destroy the affected leaves, then check the trees nearby.

Sepedi: ______________________________________________

### 17. `advice_leaf_miner`

File: `public/audio/advice_leaf_miner.mp3`

English: Remove and destroy the damaged leaves, and tell the cooperative.

Sepedi: ______________________________________________

### 18. `overall_healthy`

File: `public/audio/overall_healthy.mp3`

English: All three leaves look healthy.

Sepedi: ______________________________________________

### 19. `overall_leaf_rust`

File: `public/audio/overall_leaf_rust.mp3`

English: Some leaves may have coffee leaf rust.

Sepedi: ______________________________________________

### 20. `overall_leaf_miner`

File: `public/audio/overall_leaf_miner.mp3`

English: Some leaves may have leaf miner damage.

Sepedi: ______________________________________________

### 21. `report_saved`

File: `public/audio/report_saved.mp3`

English: Your report is saved and the extension officer will check it.

Sepedi: ______________________________________________

### 22. `photo_failed`

File: `public/audio/photo_failed.mp3`

English: The photo did not work, please try again.

Sepedi: ______________________________________________

### 23. `delete_warning`

File: `public/audio/delete_warning.mp3`

English: This deletes all your data from this phone.

Sepedi: ______________________________________________

## Part 2: text on screen only, no recording needed (155 items)

Words in curly brackets, like {count}, are filled in by the app. Keep them in your translation.

### Section: common

- `app_name`: Leihlo

  Sepedi: ______________________________________________

- `app_tagline`: The extension officer's eye on your farm.

  Sepedi: ______________________________________________

- `lang_nso`: Sepedi

  Sepedi: ______________________________________________

- `lang_en`: English

  Sepedi: ______________________________________________

- `lang_toggle_label`: Language

  Sepedi: ______________________________________________

- `nav_label`: Main menu

  Sepedi: ______________________________________________

- `nav_check`: Check

  Sepedi: ______________________________________________

- `nav_reports`: My reports

  Sepedi: ______________________________________________

- `nav_about`: About

  Sepedi: ______________________________________________

- `simulated_label`: Simulated

  Sepedi: ______________________________________________

- `mock_banner`: Mock mode: no model loaded. Leaf results are simulated.

  Sepedi: ______________________________________________

- `mock_banner_failed`: The model could not load. Mock mode: leaf results are simulated.

  Sepedi: ______________________________________________

- `mock_result_note`: This result comes from the simulated classifier, not a real model.

  Sepedi: ______________________________________________

- `button_play`: Listen

  Sepedi: ______________________________________________

- `button_replay`: Listen again

  Sepedi: ______________________________________________

- `button_cancel`: Cancel

  Sepedi: ______________________________________________

- `button_close`: Close

  Sepedi: ______________________________________________

- `button_capture`: Take the photo

  Sepedi: ______________________________________________

- `status_offline`: Offline

  Sepedi: ______________________________________________

- `status_offline_saved`: Offline, saved on phone

  Sepedi: ______________________________________________

- `status_sending`: Sending

  Sepedi: ______________________________________________

- `status_waiting_count`: {count} saved, not sent yet

  Sepedi: ______________________________________________

- `status_all_sent`: Online, all sent

  Sepedi: ______________________________________________

- `sync_failed`: Could not reach the server. Your reports are safe on this phone.

  Sepedi: ______________________________________________

### Section: welcome

- `welcome_title`: Welcome to Leihlo

  Sepedi: ______________________________________________

- `consent_title`: Your data

  Sepedi: ______________________________________________

- `setup_title`: About you

  Sepedi: ______________________________________________

- `field_name`: Your name

  Sepedi: ______________________________________________

- `field_member_number`: Cooperative member number

  Sepedi: ______________________________________________

- `field_plot_name`: Plot name

  Sepedi: ______________________________________________

- `button_agree_start`: I agree, start

  Sepedi: ______________________________________________

- `form_missing_fields`: Please fill in all three boxes.

  Sepedi: ______________________________________________

### Section: check

- `check_title`: Weekend crop check

  Sepedi: ______________________________________________

- `step_label`: Step {step} of {total}

  Sepedi: ______________________________________________

- `zone_upper`: Upper slope

  Sepedi: ______________________________________________

- `zone_lower`: Lower slope

  Sepedi: ______________________________________________

- `leaf_label`: Leaf {number}

  Sepedi: ______________________________________________

- `button_take_photo`: Take photo

  Sepedi: ______________________________________________

- `button_choose_photo`: Choose saved photo

  Sepedi: ______________________________________________

- `button_live_camera`: Live camera

  Sepedi: ______________________________________________

- `button_cancel_check`: Cancel this check

  Sepedi: ______________________________________________

- `checking_leaf`: Checking the leaf

  Sepedi: ______________________________________________

### Section: result

- `leaf_result_title`: Leaf {number} result

  Sepedi: ______________________________________________

- `button_retake`: Retake

  Sepedi: ______________________________________________

- `button_next_leaf`: Next leaf

  Sepedi: ______________________________________________

- `button_see_overall`: See overall result

  Sepedi: ______________________________________________

- `overall_title`: Overall result

  Sepedi: ______________________________________________

- `confidence_label`: Confidence

  Sepedi: ______________________________________________

- `confidence_high`: High

  Sepedi: ______________________________________________

- `confidence_medium`: Medium

  Sepedi: ______________________________________________

- `confidence_not_sure`: Not sure

  Sepedi: ______________________________________________

- `next_step_label`: Next step

  Sepedi: ______________________________________________

- `not_final_note`: This is not the final answer. The extension officer makes the final call.

  Sepedi: ______________________________________________

- `button_done`: Done

  Sepedi: ______________________________________________

- `button_new_check`: New check

  Sepedi: ______________________________________________

- `photo_alt`: Leaf photo {number}

  Sepedi: ______________________________________________

### Section: classes

- `class_healthy`: Healthy

  Sepedi: ______________________________________________

- `class_leaf_rust`: Coffee leaf rust

  Sepedi: ______________________________________________

- `class_leaf_miner`: Leaf miner

  Sepedi: ______________________________________________

- `class_not_a_leaf`: Not a leaf

  Sepedi: ______________________________________________

- `class_unknown`: Unknown

  Sepedi: ______________________________________________

### Section: reports

- `reports_title`: My reports

  Sepedi: ______________________________________________

- `reports_empty`: No checks yet.

  Sepedi: ______________________________________________

- `report_status_saved`: Saved on phone

  Sepedi: ______________________________________________

- `report_status_sent`: Sent

  Sepedi: ______________________________________________

- `report_status_confirmed`: Confirmed by officer

  Sepedi: ______________________________________________

- `report_status_corrected`: Corrected by officer

  Sepedi: ______________________________________________

- `button_sync_now`: Send now

  Sepedi: ______________________________________________

- `model_answer_label`: App result

  Sepedi: ______________________________________________

- `officer_answer_label`: Officer answer

  Sepedi: ______________________________________________

- `waiting_for_officer`: Waiting for the extension officer.

  Sepedi: ______________________________________________

- `button_delete_all`: Delete all my data

  Sepedi: ______________________________________________

- `delete_confirm_title`: Delete everything?

  Sepedi: ______________________________________________

- `button_delete_confirm`: Yes, delete

  Sepedi: ______________________________________________

- `delete_done`: All your data is deleted from this phone.

  Sepedi: ______________________________________________

- `delete_server_note`: This also removes your sent reports from the server, if the phone is online now.

  Sepedi: ______________________________________________

### Section: sms

- `sms_simulated_label`: Simulated SMS

  Sepedi: ______________________________________________

- `sms_preview_caption`: What the farmer gets on a basic phone.

  Sepedi: ______________________________________________

- `sms_from`: Leihlo

  Sepedi: ______________________________________________

- `sms_length`: {count} characters, {parts} SMS

  Sepedi: ______________________________________________

- `sms_intro`: Leihlo: the extension officer checked your report from {date}, {plot}.

  Sepedi: ______________________________________________

- `sms_confirmed`: The officer agrees with the app.

  Sepedi: ______________________________________________

- `sms_corrected`: The officer changed the app result.

  Sepedi: ______________________________________________

- `sms_result`: Result: {result}.

  Sepedi: ______________________________________________

- `sms_next_step`: Next step: {advice}

  Sepedi: ______________________________________________

- `sms_note`: Note: {note}

  Sepedi: ______________________________________________

### Section: officer

- `note_none`: No note

  Sepedi: ______________________________________________

- `note_visit`: I will visit your farm soon.

  Sepedi: ______________________________________________

- `note_clearer_photos`: Please take clearer photos next time.

  Sepedi: ______________________________________________

- `note_bring_sample`: Please bring a leaf sample to the cooperative.

  Sepedi: ______________________________________________

- `note_keep_checking`: Good work, keep checking every week.

  Sepedi: ______________________________________________

- `officer_title`: Officer review

  Sepedi: ______________________________________________

- `officer_intro`: Check each leaf. Confirm the app result or correct it.

  Sepedi: ______________________________________________

- `officer_demo_note`: Single device demo: reports made on this device appear here, even without a network.

  Sepedi: ______________________________________________

- `officer_labelled_count`: Labelled photos on this device: {count}

  Sepedi: ______________________________________________

- `button_export`: Export corrected dataset

  Sepedi: ______________________________________________

- `export_empty`: No labelled photos yet.

  Sepedi: ______________________________________________

- `export_done`: Dataset exported: {count} photos.

  Sepedi: ______________________________________________

- `officer_server_title`: Server

  Sepedi: ______________________________________________

- `officer_key_label`: Officer access code

  Sepedi: ______________________________________________

- `officer_fetch`: Get reports from server

  Sepedi: ______________________________________________

- `officer_fetch_done`: {count} new reports from the server.

  Sepedi: ______________________________________________

- `officer_fetch_failed`: Could not reach the server. Showing reports on this device.

  Sepedi: ______________________________________________

- `officer_tab_waiting`: Waiting ({count})

  Sepedi: ______________________________________________

- `officer_tab_done`: Done ({count})

  Sepedi: ______________________________________________

- `officer_queue_empty`: No reports waiting.

  Sepedi: ______________________________________________

- `officer_done_empty`: No checked reports yet.

  Sepedi: ______________________________________________

- `officer_source_device`: On this device

  Sepedi: ______________________________________________

- `officer_source_server`: From server

  Sepedi: ______________________________________________

- `officer_farmer_line`: {name}, member number {member}, plot {plot}

  Sepedi: ______________________________________________

- `officer_classifier_mock`: Mock classifier

  Sepedi: ______________________________________________

- `officer_classifier_model`: On-device model

  Sepedi: ______________________________________________

- `officer_app_overall`: App overall result

  Sepedi: ______________________________________________

- `officer_model_result`: Model top class: {result}, {percent} percent

  Sepedi: ______________________________________________

- `button_confirm`: Confirm

  Sepedi: ______________________________________________

- `button_correct`: Correct

  Sepedi: ______________________________________________

- `correct_pick_class`: Correct class

  Sepedi: ______________________________________________

- `officer_final_label`: Officer label

  Sepedi: ______________________________________________

- `note_label`: Note for the farmer (optional)

  Sepedi: ______________________________________________

- `button_send_decision`: Save and send to farmer

  Sepedi: ______________________________________________

- `decision_pending_leaves`: Confirm or correct every leaf first.

  Sepedi: ______________________________________________

- `decision_saved`: Saved. The farmer's report is updated.

  Sepedi: ______________________________________________

- `decision_sync_failed`: Saved on this device. The server could not be reached.

  Sepedi: ______________________________________________

- `officer_decided_on`: Checked on {date}

  Sepedi: ______________________________________________

- `link_farmer_app`: Farmer app

  Sepedi: ______________________________________________

- `link_officer`: Officer review

  Sepedi: ______________________________________________

### Section: about

- `about_title`: About and limits

  Sepedi: ______________________________________________

- `about_what_title`: What Leihlo does

  Sepedi: ______________________________________________

- `about_what_body`: Leihlo looks at photos of coffee leaves on this phone and gives a first result with one next step.

  Sepedi: ______________________________________________

- `about_human_decides`: It does not decide anything. The extension officer checks every report and makes the final call.

  Sepedi: ______________________________________________

- `about_model_title`: Leaf checker

  Sepedi: ______________________________________________

- `about_model_mock`: Mock mode. No model files are installed, so a simple colour rule stands in for the model.

  Sepedi: ______________________________________________

- `about_model_real`: On-device model. Classes: {labels}.

  Sepedi: ______________________________________________

- `about_threshold`: Results below {percent} percent confidence show as not sure.

  Sepedi: ______________________________________________

- `about_data_title`: Data sources

  Sepedi: ______________________________________________

- `about_data_source`: Training images: [dataset name and link, to be added]

  Sepedi: ______________________________________________

- `about_data_license`: License: [license, to be added]

  Sepedi: ______________________________________________

- `about_data_size`: Dataset size: [number of images per class, to be added]

  Sepedi: ______________________________________________

- `about_limits_title`: What the data does not cover

  Sepedi: ______________________________________________

- `about_limits_fields`: The training photos were not taken on your farm.

  Sepedi: ______________________________________________

- `about_limits_conditions`: Light, coffee variety and local diseases here may be different.

  Sepedi: ______________________________________________

- `about_limits_classes`: The app only knows healthy leaves, coffee leaf rust and leaf miner. Anything else shows as not sure.

  Sepedi: ______________________________________________

- `about_advice_title`: Advice

  Sepedi: ______________________________________________

- `about_advice_draft`: The advice list is a draft. The extension service must check it before real use.

  Sepedi: ______________________________________________

- `about_privacy_title`: Privacy

  Sepedi: ______________________________________________

- `about_privacy_stored`: Your name, member number, plot name and photos are stored on this phone.

  Sepedi: ______________________________________________

- `about_privacy_sent`: Reports are sent only to the extension officer's server. There are no ads and no tracking.

  Sepedi: ______________________________________________

- `about_privacy_export`: Exported training data has photos and labels only, with no names or member numbers.

  Sepedi: ______________________________________________

- `about_lost_title`: If the phone is lost or shared

  Sepedi: ______________________________________________

- `about_lost_shared`: Anyone who opens the app on this phone can see your reports. Use Delete all my data before you hand the phone on.

  Sepedi: ______________________________________________

- `about_lost_lost`: If the phone is lost, ask the extension officer to remove your reports from the server.

  Sepedi: ______________________________________________

- `about_offline_title`: Works without network

  Sepedi: ______________________________________________

- `about_offline_ready`: Ready to work offline.

  Sepedi: ______________________________________________

- `about_offline_not_ready`: Still saving files for offline use. Open the app once on a network.

  Sepedi: ______________________________________________

- `about_version`: Prototype for the Small AI for Development hackathon.

  Sepedi: ______________________________________________
