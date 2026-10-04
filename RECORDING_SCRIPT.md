# Leihlo recording and translation script

This file is generated from `public/strings.json` by `npm run recording-script`. Edit the JSON, not this file.

Sepedi status: 9 lines written by the team, 171 machine drafts, 0 blank.

How to use it:

1. Lines marked "(machine draft, check)" were drafted by machine and need review by a native speaker.
2. To fix a line, edit the `sepedi` field of the same key in `public/strings.json`. When a line is checked, set its `sepedi_source` to `"human"`.
3. Record each clip in Part 1 as a short MP3 and save it as the file name shown, inside `public/audio/`. Record from the checked Sepedi text.
4. Run `npm run recording-script` to refresh this file, and `npm run build` so new text and clips are bundled for offline use.

Recording tips: one speaker, a quiet room, the phone held about 20 cm away, a calm and slow voice. Mono MP3 at 64 kbps is enough. Keep each clip under 5 seconds.

## Part 1: clips to record (23 clips)

### 1. `welcome_intro`

File: `public/audio/welcome_intro.mp3`

English: Leihlo helps you check your coffee leaves.

Sepedi: Leihlo o go thuša go lekola matlakala a gago a kofi

### 2. `consent_stored`

File: `public/audio/consent_stored.mp3`

English: Your name, photos and results are saved on this phone.

Sepedi: Leina la gago, dinepe le dipoelo di bolokilwe mo founong ye

### 3. `consent_who_sees`

File: `public/audio/consent_who_sees.mp3`

English: Your reports go only to your extension officer.

Sepedi: Dipego tša gago di ya fela go mohlankedi wa gago wa katoloso.

### 4. `consent_delete`

File: `public/audio/consent_delete.mp3`

English: You can delete all your data at any time in My reports.

Sepedi: O ka phumola data ya gago ka moka nako efe goba efe ka dipegong tša Ka

### 5. `setup_prompt`

File: `public/audio/setup_prompt.mp3`

English: Type your name, member number and plot name.

Sepedi: Thaepa leina la gago, nomoro ya leloko le leina la ploto.

### 6. `zone_prompt`

File: `public/audio/zone_prompt.mp3`

English: Which part of the plot are you checking?

Sepedi: Ke karolo efe ya plot yeo o e lekolago?

### 7. `leaf_prompt_1`

File: `public/audio/leaf_prompt_1.mp3`

English: Take a photo of the first leaf.

Sepedi: tsea senepe sa lekhasi la pele

### 8. `leaf_prompt_2`

File: `public/audio/leaf_prompt_2.mp3`

English: Take a photo of the second leaf.

Sepedi: tsea senepe sa letlakala la bobedi.

### 9. `leaf_prompt_3`

File: `public/audio/leaf_prompt_3.mp3`

English: Take a photo of the third leaf.

Sepedi: tsea senepe sa letlakala la boraro

### 10. `photo_tip`

File: `public/audio/photo_tip.mp3`

English: Hold one leaf flat in daylight, close to the camera.

Sepedi (machine draft, check): Swara letlakala le tee le otlologile seetšeng sa letšatši, kgauswi le khamera.

### 11. `result_healthy`

File: `public/audio/result_healthy.mp3`

English: This leaf looks healthy.

Sepedi (machine draft, check): Letlakala le le bonagala le phetše gabotse.

### 12. `result_leaf_rust`

File: `public/audio/result_leaf_rust.mp3`

English: This leaf may have coffee leaf rust.

Sepedi (machine draft, check): Letlakala le le ka ba le bolwetši bja matheba a namune.

### 13. `result_leaf_miner`

File: `public/audio/result_leaf_miner.mp3`

English: This leaf may have leaf miner damage.

Sepedi (machine draft, check): Letlakala le le ka ba le senyegile ka diboko tša matlakala.

### 14. `result_not_sure`

File: `public/audio/result_not_sure.mp3`

English: Not sure, ask the extension officer.

Sepedi (machine draft, check): Ga ke na bonnete, botšiša mohlankedi wa katoloso.

### 15. `advice_healthy`

File: `public/audio/advice_healthy.mp3`

English: Keep checking your trees every week.

Sepedi (machine draft, check): Tšwela pele o lekola mehlare ya gago beke le beke.

### 16. `advice_leaf_rust`

File: `public/audio/advice_leaf_rust.mp3`

English: Remove and destroy the affected leaves, then check the trees nearby.

Sepedi (machine draft, check): Ntšha matlakala ao a amegilego o a fediše, ke moka o lekole mehlare ye e lego kgauswi.

### 17. `advice_leaf_miner`

File: `public/audio/advice_leaf_miner.mp3`

English: Remove and destroy the damaged leaves, and tell the cooperative.

Sepedi (machine draft, check): Ntšha matlakala ao a senyegilego o a fediše, o be o botše mokgatlo.

### 18. `overall_healthy`

File: `public/audio/overall_healthy.mp3`

English: All three leaves look healthy.

Sepedi (machine draft, check): Matlakala ka moka a mararo a bonagala a phetše gabotse.

### 19. `overall_leaf_rust`

File: `public/audio/overall_leaf_rust.mp3`

English: Some leaves may have coffee leaf rust.

Sepedi (machine draft, check): Matlakala a mangwe a ka ba le bolwetši bja matheba a namune.

### 20. `overall_leaf_miner`

File: `public/audio/overall_leaf_miner.mp3`

English: Some leaves may have leaf miner damage.

Sepedi (machine draft, check): Matlakala a mangwe a ka ba a senyegile ka diboko tša matlakala.

### 21. `report_saved`

File: `public/audio/report_saved.mp3`

English: Your report is saved and the extension officer will check it.

Sepedi (machine draft, check): Pego ya gago e bolokilwe, mohlankedi wa katoloso o tla e lekola.

### 22. `photo_failed`

File: `public/audio/photo_failed.mp3`

English: The photo did not work, please try again.

Sepedi (machine draft, check): Senepe ga se a šoma, hle leka gape.

### 23. `delete_warning`

File: `public/audio/delete_warning.mp3`

English: This deletes all your data from this phone.

Sepedi (machine draft, check): Se se tla phumola data ya gago ka moka mo founong ye.

## Part 2: text on screen only, no recording needed (157 items)

Words in curly brackets, like {count}, are filled in by the app. Keep them in your translation.

### Section: common

- `app_name`: Leihlo

  Sepedi (machine draft, check): Leihlo

- `app_tagline`: The extension officer's eye on your farm.

  Sepedi (machine draft, check): Leihlo la mohlankedi wa katoloso polaseng ya gago.

- `lang_nso`: Sepedi

  Sepedi (machine draft, check): Sepedi

- `lang_en`: English

  Sepedi (machine draft, check): English

- `lang_toggle_label`: Language

  Sepedi (machine draft, check): Polelo

- `nav_label`: Main menu

  Sepedi (machine draft, check): Lenaneo

- `nav_check`: Check

  Sepedi (machine draft, check): Tekolo

- `nav_reports`: My reports

  Sepedi (machine draft, check): Dipego tša ka

- `nav_about`: About

  Sepedi (machine draft, check): Ka ga Leihlo

- `simulated_label`: Simulated

  Sepedi (machine draft, check): Ga se ya nnete

- `mock_banner`: Mock mode: no model loaded. Leaf results are simulated.

  Sepedi (machine draft, check): Mokgwa wa teko: ga go na modele. Dipoelo tša matlakala ga se tša nnete.

- `mock_banner_failed`: The model could not load. Mock mode: leaf results are simulated.

  Sepedi (machine draft, check): Modele ga o a kgona go bulega. Mokgwa wa teko: dipoelo tša matlakala ga se tša nnete.

- `mock_result_note`: This result comes from the simulated classifier, not a real model.

  Sepedi (machine draft, check): Dipoelo tše di tšwa lenaneong la teko, e sego modeleng wa nnete.

- `button_play`: Listen

  Sepedi (machine draft, check): Theeletša

- `button_replay`: Listen again

  Sepedi (machine draft, check): Theeletša gape

- `button_cancel`: Cancel

  Sepedi (machine draft, check): Khansela

- `button_close`: Close

  Sepedi (machine draft, check): Tswalela

- `button_capture`: Take the photo

  Sepedi (machine draft, check): Tšea senepe

- `status_online`: Online

  Sepedi (machine draft, check): Go na le neteweke

- `status_offline`: Offline

  Sepedi (machine draft, check): Ga go na neteweke

- `status_offline_saved`: Offline, saved on phone

  Sepedi (machine draft, check): Ga go na neteweke, e bolokilwe founong

- `status_sending`: Sending

  Sepedi (machine draft, check): Go a romelwa

- `status_waiting_count`: {count} saved, not sent yet

  Sepedi (machine draft, check): {count} di bolokilwe, ga di eso romelwe

- `status_all_sent`: Online, all sent

  Sepedi (machine draft, check): Go na le neteweke, ka moka di rometšwe

- `sync_failed`: Could not reach the server. Your reports are safe on this phone.

  Sepedi (machine draft, check): Ga re a kgona go fihla go seva. Dipego tša gago di bolokegile mo founong ye.

### Section: welcome

- `welcome_title`: Welcome to Leihlo

  Sepedi (machine draft, check): O amogelwa go Leihlo

- `consent_title`: Your data

  Sepedi (machine draft, check): Data ya gago

- `setup_title`: About you

  Sepedi (machine draft, check): Ka ga wena

- `field_name`: Your name

  Sepedi (machine draft, check): Leina la gago

- `field_member_number`: Cooperative member number

  Sepedi (machine draft, check): Nomoro ya leloko la mokgatlo

- `field_plot_name`: Plot name

  Sepedi (machine draft, check): Leina la ploto

- `button_agree_start`: I agree, start

  Sepedi (machine draft, check): Ke a dumela, thoma

- `form_missing_fields`: Please fill in all three boxes.

  Sepedi (machine draft, check): Hle tlatša mafelo a mararo ka moka.

### Section: check

- `check_title`: Weekend crop check

  Sepedi (machine draft, check): Tekolo ya mafelelo a beke

- `step_label`: Step {step} of {total}

  Sepedi (machine draft, check): Kgato ya {step} go tše {total}

- `zone_upper`: Upper slope

  Sepedi (machine draft, check): Karolo ya godimo

- `zone_lower`: Lower slope

  Sepedi (machine draft, check): Karolo ya tlase

- `leaf_label`: Leaf {number}

  Sepedi (machine draft, check): Letlakala la {number}

- `button_take_photo`: Take photo

  Sepedi (machine draft, check): Tšea senepe

- `button_choose_photo`: Choose saved photo

  Sepedi (machine draft, check): Kgetha senepe se se bolokilwego

- `button_live_camera`: Live camera

  Sepedi (machine draft, check): Khamera ye e phelago

- `button_cancel_check`: Cancel this check

  Sepedi (machine draft, check): Khansela tekolo ye

- `checking_leaf`: Checking the leaf

  Sepedi (machine draft, check): Re lekola letlakala

### Section: result

- `leaf_result_title`: Leaf {number} result

  Sepedi (machine draft, check): Dipoelo tša letlakala la {number}

- `button_retake`: Retake

  Sepedi (machine draft, check): Tšea gape

- `button_next_leaf`: Next leaf

  Sepedi (machine draft, check): Letlakala le le latelago

- `button_see_overall`: See overall result

  Sepedi (machine draft, check): Bona dipoelo ka moka

- `overall_title`: Overall result

  Sepedi (machine draft, check): Dipoelo ka moka

- `confidence_label`: Confidence

  Sepedi (machine draft, check): Bonnete

- `confidence_high`: High

  Sepedi (machine draft, check): Bo godimo

- `confidence_medium`: Medium

  Sepedi (machine draft, check): Bo magareng

- `confidence_not_sure`: Not sure

  Sepedi (machine draft, check): Ga ke na bonnete

- `next_step_label`: Next step

  Sepedi (machine draft, check): Kgato ye e latelago

- `not_final_note`: This is not the final answer. The extension officer makes the final call.

  Sepedi (machine draft, check): Se ga se karabo ya mafelelo. Mohlankedi wa katoloso ke yena a dirago sephetho.

- `button_done`: Done

  Sepedi (machine draft, check): Ke feditše

- `button_new_check`: New check

  Sepedi (machine draft, check): Tekolo ye mpsha

- `photo_alt`: Leaf photo {number}

  Sepedi (machine draft, check): Senepe sa letlakala la {number}

### Section: classes

- `class_healthy`: Healthy

  Sepedi (machine draft, check): Maphelo a mabotse

- `class_leaf_rust`: Coffee leaf rust

  Sepedi (machine draft, check): Bolwetši bja matheba a namune

- `class_leaf_miner`: Leaf miner

  Sepedi (machine draft, check): Diboko tša matlakala

- `class_not_a_leaf`: Not a leaf

  Sepedi (machine draft, check): Ga se letlakala

- `class_unknown`: Unknown

  Sepedi (machine draft, check): Ga go tsebjwe

### Section: reports

- `reports_title`: My reports

  Sepedi (machine draft, check): Dipego tša ka

- `reports_empty`: No checks yet.

  Sepedi (machine draft, check): Ga go na ditekolo ga bjale.

- `report_status_saved`: Saved on phone

  Sepedi (machine draft, check): E bolokilwe founong

- `report_status_sent`: Sent

  Sepedi (machine draft, check): E rometšwe

- `report_status_confirmed`: Confirmed by officer

  Sepedi (machine draft, check): E netefaditšwe ke mohlankedi

- `report_status_corrected`: Corrected by officer

  Sepedi (machine draft, check): E lokišitšwe ke mohlankedi

- `button_sync_now`: Send now

  Sepedi (machine draft, check): Romela bjale

- `model_answer_label`: App result

  Sepedi (machine draft, check): Dipoelo tša Leihlo

- `officer_answer_label`: Officer answer

  Sepedi (machine draft, check): Karabo ya mohlankedi

- `waiting_for_officer`: Waiting for the extension officer.

  Sepedi (machine draft, check): Re emetše mohlankedi wa katoloso.

- `button_delete_all`: Delete all my data

  Sepedi (machine draft, check): Phumola data ya ka ka moka

- `delete_confirm_title`: Delete everything?

  Sepedi (machine draft, check): Phumola tšohle?

- `button_delete_confirm`: Yes, delete

  Sepedi (machine draft, check): Ee, phumola

- `delete_done`: All your data is deleted from this phone.

  Sepedi (machine draft, check): Data ya gago ka moka e phumotšwe mo founong ye.

- `delete_server_note`: This also removes your sent reports from the server, if the phone is online now.

  Sepedi (machine draft, check): Se se phumola le dipego tšeo o di rometšego go seva, ge founo e na le neteweke bjale.

### Section: sms

- `sms_simulated_label`: Simulated SMS

  Sepedi (machine draft, check): Molaetša wo ga se wa nnete

- `sms_preview_caption`: What the farmer gets on a basic phone.

  Sepedi (machine draft, check): Se molemi a se hwetšago founong ya gagwe.

- `sms_from`: Leihlo

  Sepedi (machine draft, check): Leihlo

- `sms_length`: {count} characters, {parts} SMS

  Sepedi (machine draft, check): {count} ditlhaka, {parts} melaetša

- `sms_intro`: Leihlo {date}, {plot}.

  Sepedi (machine draft, check): Leihlo {date}, {plot}.

- `sms_confirmed`: Your extension officer agrees with the app.

  Sepedi (machine draft, check): Mohlankedi wa gago wa katoloso o dumelelana le Leihlo.

- `sms_corrected`: Your extension officer changed the app result.

  Sepedi (machine draft, check): Mohlankedi wa gago wa katoloso o fetotše dipoelo tša Leihlo.

- `sms_result`: Result: {result}.

  Sepedi (machine draft, check): Dipoelo: {result}.

- `sms_next_step`: Next step: {advice}

  Sepedi (machine draft, check): Kgato ye e latelago: {advice}

- `sms_note`: Note: {note}

  Sepedi (machine draft, check): Molaetša: {note}

### Section: officer

- `note_none`: No note

  Sepedi (machine draft, check): Ga go na molaetša

- `note_visit`: I will visit your farm soon.

  Sepedi (machine draft, check): Ke tla etela polase ya gago kgauswinyane.

- `note_clearer_photos`: Please take clearer photos next time.

  Sepedi (machine draft, check): Hle tšea dinepe tše di bonagalago gabotse nakong ye e tlago.

- `note_bring_sample`: Please bring a leaf sample to the cooperative.

  Sepedi (machine draft, check): Hle tliša mohlala wa letlakala go mokgatlo.

- `note_keep_checking`: Good work, keep checking every week.

  Sepedi (machine draft, check): O šomile gabotse, tšwela pele o lekola beke le beke.

- `officer_title`: Officer review

  Sepedi (machine draft, check): Tekolo ya mohlankedi

- `officer_intro`: Check each leaf. Confirm the app result or correct it.

  Sepedi (machine draft, check): Lekola letlakala le lengwe le le lengwe. Netefatša dipoelo tša Leihlo goba o di lokiše.

- `officer_demo_note`: Single device demo: reports made on this device appear here, even without a network.

  Sepedi (machine draft, check): Pontšho ya sedirišwa se tee: dipego tšeo di dirilwego sedirišweng se di tšwelela mo, le ge go se na neteweke.

- `officer_labelled_count`: Labelled photos on this device: {count}

  Sepedi (machine draft, check): Dinepe tše di nago le maina sedirišweng se: {count}

- `button_export`: Export corrected dataset

  Sepedi (machine draft, check): Ntšhetša ntle data ye e lokišitšwego

- `export_empty`: No labelled photos yet.

  Sepedi (machine draft, check): Ga go na dinepe tše di nago le maina ga bjale.

- `export_done`: Dataset exported: {count} photos.

  Sepedi (machine draft, check): Data e ntšhitšwe: dinepe tše {count}.

- `officer_server_title`: Server

  Sepedi (machine draft, check): Seva

- `officer_key_label`: Officer access code

  Sepedi (machine draft, check): Khoutu ya mohlankedi

- `officer_fetch`: Get reports from server

  Sepedi (machine draft, check): Hwetša dipego go seva

- `officer_fetch_done`: {count} new reports from the server.

  Sepedi (machine draft, check): Dipego tše mpsha tše {count} go tšwa go seva.

- `officer_fetch_failed`: Could not reach the server. Showing reports on this device.

  Sepedi (machine draft, check): Ga re a kgona go fihla go seva. Re bontšha dipego tša sedirišwa se.

- `officer_tab_waiting`: Waiting ({count})

  Sepedi (machine draft, check): Tše di emetšego ({count})

- `officer_tab_done`: Done ({count})

  Sepedi (machine draft, check): Tše di feditšwego ({count})

- `officer_queue_empty`: No reports waiting.

  Sepedi (machine draft, check): Ga go na dipego tše di emetšego.

- `officer_done_empty`: No checked reports yet.

  Sepedi (machine draft, check): Ga go na dipego tše di lekotšwego ga bjale.

- `officer_source_device`: On this device

  Sepedi (machine draft, check): Sedirišweng se

- `officer_source_server`: From server

  Sepedi (machine draft, check): Go tšwa go seva

- `officer_farmer_line`: {name}, member number {member}, plot {plot}

  Sepedi (machine draft, check): {name}, nomoro ya leloko {member}, ploto {plot}

- `officer_classifier_mock`: Mock classifier

  Sepedi (machine draft, check): Lenaneo la teko

- `officer_classifier_model`: On-device model

  Sepedi (machine draft, check): Modele wa sedirišwa

- `officer_app_overall`: App overall result

  Sepedi (machine draft, check): Dipoelo ka moka tša Leihlo

- `officer_model_result`: Model top class: {result}, {percent} percent

  Sepedi (machine draft, check): Karabo ya modele: {result}, diphesente tše {percent}

- `button_confirm`: Confirm

  Sepedi (machine draft, check): Netefatša

- `button_correct`: Correct

  Sepedi (machine draft, check): Lokiša

- `correct_pick_class`: Correct class

  Sepedi (machine draft, check): Mohuta wo o nepagetšego

- `officer_final_label`: Officer label

  Sepedi (machine draft, check): Karabo ya mohlankedi

- `note_label`: Note for the farmer (optional)

  Sepedi (machine draft, check): Molaetša go molemi (ga se wa gapeletšwa)

- `button_send_decision`: Save and send to farmer

  Sepedi (machine draft, check): Boloka o romele go molemi

- `decision_pending_leaves`: Confirm or correct every leaf first.

  Sepedi (machine draft, check): Netefatša goba lokiša letlakala le lengwe le le lengwe pele.

- `decision_saved`: Saved. The farmer's report is updated.

  Sepedi (machine draft, check): E bolokilwe. Pego ya molemi e mpshafaditšwe.

- `decision_sync_failed`: Saved on this device. The server could not be reached.

  Sepedi (machine draft, check): E bolokilwe sedirišweng se. Ga re a kgona go fihla go seva.

- `officer_decided_on`: Checked on {date}

  Sepedi (machine draft, check): E lekotšwe ka {date}

- `link_farmer_app`: Farmer app

  Sepedi (machine draft, check): Leihlo la molemi

- `link_officer`: Officer review

  Sepedi (machine draft, check): Tekolo ya mohlankedi

### Section: about

- `about_title`: About and limits

  Sepedi (machine draft, check): Ka ga Leihlo le mellwane

- `about_what_title`: What Leihlo does

  Sepedi (machine draft, check): Seo Leihlo a se dirago

- `about_what_body`: Leihlo looks at photos of coffee leaves on this phone and gives a first result with one next step.

  Sepedi (machine draft, check): Leihlo o lebelela dinepe tša matlakala a kofi mo founong ye, gomme o fa dipoelo tša mathomo le kgato e tee ye e latelago.

- `about_human_decides`: It does not decide anything. The extension officer checks every report and makes the final call.

  Sepedi (machine draft, check): Ga a dire sephetho. Mohlankedi wa katoloso o lekola pego ye nngwe le ye nngwe gomme ke yena a dirago sephetho.

- `about_model_title`: Leaf checker

  Sepedi (machine draft, check): Selekodi sa matlakala

- `about_model_mock`: Mock mode. No model files are installed, so a simple colour rule stands in for the model.

  Sepedi (machine draft, check): Mokgwa wa teko. Ga go na difaele tša modele, ka fao molao wo bonolo wa mebala o šoma legatong la modele.

- `about_model_real`: On-device model. Classes: {labels}.

  Sepedi (machine draft, check): Modele wa sedirišwa. Mehuta: {labels}.

- `about_threshold`: Results below {percent} percent confidence show as not sure.

  Sepedi (machine draft, check): Dipoelo tše di lego ka tlase ga diphesente tše {percent} tša bonnete di bontšhwa bjalo ka ga ke na bonnete.

- `about_data_title`: Data sources

  Sepedi (machine draft, check): Methopo ya data

- `about_data_source`: Training images: [dataset name and link, to be added]

  Sepedi (machine draft, check): Dinepe tša go ruta modele: [leina le linki ya data, go tla tlaleletšwa]

- `about_data_license`: License: [license, to be added]

  Sepedi (machine draft, check): Laesense: [laesense, go tla tlaleletšwa]

- `about_data_size`: Dataset size: [number of images per class, to be added]

  Sepedi (machine draft, check): Bogolo bja data: [palo ya dinepe ka mohuta, go tla tlaleletšwa]

- `about_limits_title`: What the data does not cover

  Sepedi (machine draft, check): Seo data e sa se akaretšego

- `about_limits_fields`: The training photos were not taken on your farm.

  Sepedi (machine draft, check): Dinepe tša go ruta ga se tša tšewa polaseng ya gago.

- `about_limits_conditions`: Light, coffee variety and local diseases here may be different.

  Sepedi (machine draft, check): Seetša, mohuta wa kofi le malwetši a lefelong le a ka fapana.

- `about_limits_classes`: The app only knows healthy leaves, coffee leaf rust and leaf miner. Anything else shows as not sure.

  Sepedi (machine draft, check): Leihlo o tseba fela matlakala a phetšego gabotse, bolwetši bja matheba a namune le diboko tša matlakala. Tše dingwe di bontšhwa bjalo ka ga ke na bonnete.

- `about_advice_title`: Advice

  Sepedi (machine draft, check): Dikeletšo

- `about_advice_draft`: The advice list is a draft. The extension service must check it before real use.

  Sepedi (machine draft, check): Dikeletšo tše ke tša mathomo fela. Tirelo ya katoloso e swanetše go di lekola pele di šomišwa.

- `about_privacy_title`: Privacy

  Sepedi (machine draft, check): Sephiri

- `about_privacy_stored`: Your name, member number, plot name and photos are stored on this phone.

  Sepedi (machine draft, check): Leina la gago, nomoro ya leloko, leina la ploto le dinepe di bolokilwe mo founong ye.

- `about_privacy_sent`: Reports are sent only to the extension officer's server. There are no ads and no tracking.

  Sepedi (machine draft, check): Dipego di romelwa fela go seva ya mohlankedi wa katoloso. Ga go na dipapatšo goba go latelwa.

- `about_privacy_export`: Exported training data has photos and labels only, with no names or member numbers.

  Sepedi (machine draft, check): Data ye e ntšhitšwego e na le dinepe le maina a mehuta fela, ga e na maina a batho goba dinomoro tša maloko.

- `about_lost_title`: If the phone is lost or shared

  Sepedi (machine draft, check): Ge founo e lahlegile goba e abelanwa

- `about_lost_shared`: Anyone who opens the app on this phone can see your reports. Use Delete all my data before you hand the phone on.

  Sepedi (machine draft, check): Mang le mang yo a bulago Leihlo mo founong ye a ka bona dipego tša gago. Šomiša Phumola data ya ka ka moka pele o fa motho yo mongwe founo.

- `about_lost_lost`: If the phone is lost, ask the extension officer to remove your reports from the server.

  Sepedi (machine draft, check): Ge founo e lahlegile, kgopela mohlankedi wa katoloso go tloša dipego tša gago go seva.

- `about_offline_title`: Works without network

  Sepedi (machine draft, check): E šoma ntle le neteweke

- `about_offline_ready`: Ready to work offline.

  Sepedi (machine draft, check): E lokile go šoma ntle le neteweke.

- `about_offline_not_ready`: Still saving files for offline use. Open the app once on a network.

  Sepedi (machine draft, check): Re sa boloka difaele tša go šoma ntle le neteweke. Bula Leihlo gatee o na le neteweke.

- `about_sepedi_draft`: Some Sepedi text is a machine draft awaiting review by a native speaker.

  Sepedi (machine draft, check): Mantšu a mangwe a Sepedi a ngwadilwe ke motšhene, a emetše go lekolwa ke seboledi sa Sepedi.

- `about_version`: Prototype for the Small AI for Development hackathon.

  Sepedi (machine draft, check): Mohlala wa mathomo wa phadišano ya Small AI for Development.
