# Wedding Invitation Builder

```
index.html          ទំព័រ Builder (HTML តែប៉ុណ្ណោះ)
style.css           រចនាបថនៃទំព័រ Builder
wib-data.js         theme, font, label, គំរូអត្ថបទ (TEMPLATES), គំរូរួចរាល់ (INVITATION_PRESETS), រូបតំណាង, ពណ៌សម្លៀកបំពាក់, default state, draft
wib-render.js       បង្កើត HTML/CSS នៃធៀបអញ្ជើញ (cover, ផ្នែកនីមួយៗ, gallery, ចម្រៀង, animation, ប្រតិទិន)
wib-pickers.js      ប៊ូតុងរូបតំណាងជ្រើសរើស + ផ្នែកបំពេញ (កម្មវិធី, ទំនាក់ទំនង, រូបភាព, cover, ពណ៌សម្លៀកបំពាក់)
wib-ui.js           ដំណើរការរូប/ចម្រៀង, ឯកសារភ្ញៀវ, Publish, បង់ប្រាក់, Backup, គំរូរួចរាល់ (applyPreset), ម៉ីនុយ, ចាប់ផ្តើម
manifest.json       ដំឡើងជា App (PWA)
sw.js               service worker (បើកដោយគ្មានអ៊ីនធឺណិតក្រោយចូលម្តង)
logo.png            logo
images/
  frames/           frame1.jpg … frame5.jpg
  backgrounds/      bg1.webp … bg5.webp
  covers/           cover1.jpg … cover5.jpg
  gallery/          gallery1.webp … gallery6.webp
  icons/            icon-192.png, icon-512.png
```

- លំដាប់ load ក្នុង index.html ត្រូវរក្សា៖ wib-data → wib-render → wib-pickers → wib-ui (ទាំងអស់ប្រើ global scope រួមគ្នា)។
- ពេលកែ CSS/JS សូមប្តូរ `?v=` នៃឯកសារនោះក្នុង index.html ឱ្យថ្មី (ឧ. wib-data.js?v=12 → 13)។ ពេលជំនួសរូប សូមប្តូរ `ASSET_VERSION` ក្នុង wib-data.js។
- ប្តូរឈ្មោះ folder រូប៖ កែ `ASSET_DIRS` ក្នុង wib-data.js។ ប្តូរប្រភេទឯកសាររូប (jpg / webp / png)៖ កែ `file:` ក្នុង `KBACH_FRAME_STYLES`, `KBACH_BG_STYLES`, `COVER_ART`, `GALLERY_ART`។

## គំរូរួចរាល់ (Ready Templates)

- មាន ៣ គំរូ៖ `classic` (ប្រពៃណីមាស), `romantic` (ស្នេហ៍ទន់ភ្លន់), `elegant` (ទំនើបថ្លៃថ្នូរ) នៅក្នុង `INVITATION_PRESETS` (wib-data.js)។
- គំរូនីមួយៗចាប់ផ្តើមពី `PRESET_DESIGN_BASE` ដូច្នេះការជ្រើសគំរូជំនួសរចនាទាំងមូល (theme, ពុម្ពអក្សរ, gallery, រូបតំណាង cover/gallery, ស៊ុម + ចលនា, ផ្ទៃខាងក្រោយ + ភាពថ្លា/ព្រិល, ចលនាអក្សរ, ការបើកដំបូង, រូបរាងរូបគម្រប)។
- ចង់កែគំរូ៖ កែក្នុង `design:{...}` របស់គំរូនោះ។ ឈ្មោះដែលប្រើត្រូវមានក្នុង `THEMES`, `FONT_KM`, `FONT_EN`, `GALLERY_STYLES`, `KBACH_FRAME_STYLES`, `KBACH_BG_STYLES`, `FRAME_FX`, `COVER_ART`, `GALLERY_ART`។
- `applyPreset()` (wib-ui.js) បំពេញតែប្រអប់អត្ថបទដែលនៅទទេ។ រូបភាព ចម្រៀង Link ផែនទី/វិឌីអូ ឈ្មោះភ្ញៀវ មិនត្រូវបានប៉ះពាល់ទេ។

## ពណ៌សម្លៀកបំពាក់ / ពណ៌រោង

- បញ្ជីពណ៌ទាំងអស់នៅក្នុង `DRESS_PALETTE` (wib-data.js)។ ក្នុង Builder បង្ហាញតែ `DRESS_PALETTE_SHOWN` (ឥឡូវ = ៦) ពណ៌ខាងដើមក្នុងផ្នែកនីមួយៗ (wib-pickers.js) ហើយប៊ូតុង ＋ ជ្រើសពណ៌ផ្ទាល់ខ្លួនបាន។ ចង់ប្តូរ ៦ ពណ៌ គឺរៀបលំដាប់ក្នុង `DRESS_PALETTE`។
