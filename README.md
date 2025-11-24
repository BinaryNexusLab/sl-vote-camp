# Election Camp Management System

একটি সম্পূর্ণ নির্বাচনী ক্যাম্প ব্যবস্থাপনা সিস্টেম যা React, Tailwind CSS এবং LocalStorage ব্যবহার করে তৈরি।

## বৈশিষ্ট্যসমূহ

- **তিনটি অঞ্চল ব্যবস্থাপনা**: লোহাগাড়া, সাতকানিয়া এবং সাতকানিয়া পৌরসভা
- **ইউনিয়ন ব্যবস্থাপনা**: স্থির ইউনিয়ন তালিকা (নাম সম্পাদনাযোগ্য)
- **ওয়ার্ড ব্যবস্থাপনা**: ওয়ার্ড যোগ/সম্পাদনা/মুছে ফেলা
- **দায়িত্বশীল ব্যক্তি ব্যবস্থাপনা**: ইউনিয়ন ও ওয়ার্ড পর্যায়ে
- **LocalStorage**: সব তথ্য স্থানীয়ভাবে সংরক্ষিত
- **Responsive Design**: মোবাইল ও ডেস্কটপ উভয়ের জন্য অপ্টিমাইজড
- **কমপ্যাক্ট UI**: ছোট কার্ড ডিজাইন

## প্রযুক্তিগত স্ট্যাক

- **React 18**: মূল ফ্রেমওয়ার্ক
- **Tailwind CSS**: স্টাইলিং
- **Vite**: বিল্ড টুল
- **LocalStorage**: ডেটা সংরক্ষণ

## ইনস্টলেশন

### প্রয়োজনীয় সফটওয়্যার

- Node.js (v16 বা তার পরের সংস্করণ)
- npm বা yarn

### সেটআপ

1. প্রোজেক্ট ক্লোন বা ডাউনলোড করুন
2. প্রোজেক্ট ডিরেক্টরিতে যান:

   ```bash
   cd sl-vote-camp
   ```

3. Dependencies ইনস্টল করুন:

   ```bash
   npm install
   ```

4. Development server চালু করুন:

   ```bash
   npm run dev
   ```

5. ব্রাউজারে এই ঠিকানায় যান: `http://localhost:3000`

## ব্যবহার

### প্রাথমিক ডেটা

সিস্টেমটি `public/regions.json` ফাইল থেকে প্রাথমিক ডেটা লোড করে। এতে রয়েছে:

- **লোহাগাড়া**: ৯টি ইউনিয়ন (প্রতিটিতে ইউনিয়ন দায়িত্বশীল)
- **সাতকানিয়া**: ১২টি ইউনিয়ন (ঢেমশা ইউনিয়নে ১০টি ওয়ার্ডে দায়িত্বশীল আছে)
- **সাতকানিয়া পৌরসভা**: ৯টি ওয়ার্ড (সরাসরি দায়িত্বশীল)

### ডেটা পরিবর্তন

সব পরিবর্তন সাথে সাথে LocalStorage-এ সংরক্ষিত হয়। মূল ডেটায় ফিরে যেতে "মূল তথ্যে ফিরে যান" বাটনে ক্লিক করুন।

### অনুমোদিত ক্রিয়াকলাপ

1. **ইউনিয়ন নাম সম্পাদনা** (ইউনিয়ন যোগ/মুছে ফেলা যাবে না)
2. **ওয়ার্ড যোগ/সম্পাদনা/মুছে ফেলা**
3. **ইউনিয়ন দায়িত্বশীল যোগ/সম্পাদনা/মুছে ফেলা** (সর্বোচ্চ ২ জন)
4. **ওয়ার্ড দায়িত্বশীল যোগ/সম্পাদনা/মুছে ফেলা**

## প্রোজেক্ট গঠন

```
src/
├── components/          # React components
│   ├── RegionCard.jsx  # অঞ্চল কার্ড
│   ├── UnionRow.jsx    # ইউনিয়ন সারি
│   ├── WardRow.jsx     # ওয়ার্ড সারি
│   ├── PersonItem.jsx  # ব্যক্তি আইটেম
│   └── ModalForm.jsx   # মোডাল ফর্ম
├── utils/              # ইউটিলিটি ফাংশন
│   ├── storage.js      # LocalStorage র‍্যাপার
│   └── ids.js          # ID জেনারেটর
├── App.jsx             # মূল অ্যাপ কম্পোনেন্ট
├── main.jsx            # অ্যাপ এন্ট্রি পয়েন্ট
└── index.css           # গ্লোবাল স্টাইল

public/
└── regions.json        # প্রাথমিক ডেটা
```

## স্ক্রিপ্টসমূহ

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Code linting
npm run lint
```

## ডেটা মডেল

### অঞ্চল (Region)

```javascript
{
  id: string,
  name: string,
  type: "region" | "pouroshova",
  hasUnions: boolean,
  unions?: Union[],
  wards?: Ward[]
}
```

### ইউনিয়ন (Union)

```javascript
{
  id: string,
  name: string,
  unionResponsible: Person[],
  wards: Ward[]
}
```

### ওয়ার্ড (Ward)

```javascript
{
  id: string,
  name: string,
  persons: Person[]
}
```

### ব্যক্তি (Person)

```javascript
{
  id: string,
  name: string,
  phone: string
}
```

## ব্রাউজার সাপোর্ট

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## লাইসেন্স

MIT License

## যোগাযোগ

কোন সমস্যা বা পরামর্শের জন্য GitHub Issues ব্যবহার করুন।
