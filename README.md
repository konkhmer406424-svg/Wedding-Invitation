# Wedding Invitation Builder

```
index.html          ទំព័រ Builder (HTML តែប៉ុណ្ណោះ)
style.css           រចនាបថនៃទំព័រ Builder
wib-data.js         theme, font, label, គំរូ (templates), រូបតំណាង, default state, draft
wib-render.js       បង្កើត HTML/CSS នៃធៀបអញ្ជើញ (cover, ផ្នែកនីមួយៗ, gallery, ចម្រៀង, animation, ប្រតិទិន)
wib-pickers.js      ប៊ូតុងរូបតំណាងជ្រើសរើស + ផ្នែកបំពេញ (កម្មវិធី, ទំនាក់ទំនង, រូបភាព, cover)
wib-ui.js           ដំណើរការរូប/ចម្រៀង, ឯកសារភ្ញៀវ, Publish, បង់ប្រាក់, Backup, ម៉ីនុយ, ចាប់ផ្តើម
manifest.json       ដំឡើងជា App (PWA)
sw.js               service worker (បើកដោយគ្មានអ៊ីនធឺណិតក្រោយចូលម្តង)
logo.png            logo
images/
  frames/           frame1.png … frame5.png
  backgrounds/      bg1.png … bg5.png
  covers/           cover1.png … cover5.png
  gallery/          gallery1.png … gallery5.png
  icons/            icon-192.png, icon-512.png
```

- លំដាប់ load ក្នុង index.html ត្រូវរក្សា៖ wib-data → wib-render → wib-pickers → wib-ui (ទាំងអស់ប្រើ global scope រួមគ្នា)។
- ពេលកែ CSS/JS សូមប្តូរ `?v=1` ក្នុង index.html ឱ្យថ្មី (2, 3 …) ហើយប្តូរ `ASSET_VERSION` ក្នុង wib-data.js ពេលជំនួសរូប។
- ប្តូរឈ្មោះ folder រូប៖ កែ `ASSET_DIRS` ក្នុង wib-data.js។
