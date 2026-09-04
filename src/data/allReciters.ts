export interface ReciterItem {
  id: number;
  name: string;
  nameArabic: string;
  server: string;
  surahTotal: number;
  surahList?: string;
  qdcId?: number;
}

export function getQdcReciterId(reciter: { id: number; name?: string; nameArabic?: string }): number | null {
  if (!reciter) return null;

  // 1. Direct ID match for top popular reciters
  switch (reciter.id) {
    case 30: return 13;   // Saad Al-Ghamdi (سعد الغامدي)
    case 123: return 7;   // Mishari Rashid Alafasy (مشاري العفاسي)
    case 62: return 2;    // AbdulBaset AbdulSamad (عبد الباسط عبد الصمد - مرتل)
    case 65: return 3;    // Abdur-Rahman As-Sudais (عبد الرحمن السديس)
    case 4: return 4;     // Abu Bakr Al-Shatri (أبو بكر الشاطري)
    case 133: return 5;   // Hani Ar-Rifai (هاني الرفاعي)
    case 121: return 6;   // Mahmoud Khalil Al-Husary (محمود خليل الحصري)
    case 112: return 9;   // Mohamed Siddiq Al-Minshawi (محمد صديق المنشاوي)
    case 42: return 10;   // Sa'ud Ash-Shuraim (سعود الشريم)
    case 60: return 11;   // Abdul Muhsin Al-Qasim (عبد المحسن القاسم)
    case 87: return 14;   // Fares Abbad (فارس عباد)
    case 44: return 17;   // Sahl Yasin (سهل ياسين)
    case 50: return 18;   // Salah Bukhatir (صلاح بو خاطر)
    case 8: return 19;    // Ahmed Al-Ajmy (أحمد العجمي)
    case 49: return 43;   // Salah Al-Budair (صلاح البدير)
    case 125: return 88;  // Mostafa Ismaeel (مصطفى إسماعيل)
    case 106: return 91;  // Mohammad Al-Tablawi (محمد الطبلاوي)
    case 137: return 97;  // Yasser Ad-Dussary (ياسر الدوسري)
    case 102: return 159; // Maher Al Meaqli (ماهر المعيقلي)
    case 128: return 104; // Nasser Al-Qatami (ناصر القطامي)
    case 73: return 124;  // Abdullah Al-Matroud (عبد الله المطرود)
    case 10: return 127;  // Akram Al-Alaqmi (أكرم العلاقمي)
    case 129: return 129; // Mahmoud Ali Al-Banna (محمود علي البنا)
    case 82: return 158;  // Ali Jaber (علي جابر)
    case 18: return 160;  // Bandar Baleela (بندر بليلة)
    case 37: return 161;  // Khalifah Al Tunaiji (خليفة الطنيجي)
    case 70: return 162;  // Abdullah Awad Al-Juhani (عبد الله عواد الجهني)
    case 67: return 163;  // Abdullah Basfar (عبد الله بصفر)
    case 108: return 169; // Muhammad Jibreel (محمد جبريل)
    case 36: return 170;  // Khalid Al-Jalil (خالد الجليل)
  }

  // 2. Fuzzy name matching
  const name = (reciter.name || '').toLowerCase();
  const ar = reciter.nameArabic || '';

  if (name.includes('ghamdi') || ar.includes('الغامدي')) return 13;
  if (name.includes('afasy') || name.includes('alafasy') || ar.includes('العفاسي')) return 7;
  if (name.includes('sudais') || ar.includes('السديس')) return 3;
  if (name.includes('shatri') || ar.includes('الشاطري')) return 4;
  if (name.includes('rifai') || ar.includes('الرفاعي')) return 5;
  if (name.includes('husary') || ar.includes('الحصري')) return 6;
  if (name.includes('minshawi') || ar.includes('المنشاوي')) return 9;
  if (name.includes('shuraim') || ar.includes('الشريم')) return 10;
  if (name.includes('meaqli') || ar.includes('المعيقلي')) return 159;
  if (name.includes('ajmi') || name.includes('ajamy') || ar.includes('العجمي')) return 19;
  if (name.includes('abbad') || ar.includes('عباد')) return 14;
  if (name.includes('dussary') || ar.includes('الدوسري')) return 97;
  if (name.includes('qatami') || ar.includes('القطامي')) return 104;
  if (name.includes('jaber') || ar.includes('جابر')) return 158;
  if (name.includes('baleela') || ar.includes('بليلة')) return 160;
  if (name.includes('tunaiji') || ar.includes('الطنيجي')) return 161;
  if (name.includes('juhani') || ar.includes('الجهني')) return 162;
  if (name.includes('basfar') || ar.includes('بصفر')) return 163;
  if (name.includes('jibreel') || ar.includes('جبريل')) return 169;
  if (name.includes('jalil') || ar.includes('الجليل')) return 170;
  if (name.includes('alaqmi') || ar.includes('العلاقمي')) return 127;
  if (name.includes('bukhatir') || ar.includes('بو خاطر')) return 18;
  if (name.includes('yasin') || name.includes('yaaseen') || ar.includes('ياسين')) return 17;
  if (name.includes('budair') || ar.includes('البدير')) return 43;
  if (name.includes('matroud') || ar.includes('المطرود')) return 124;
  if (name.includes('tablawi') || name.includes('tablaway') || ar.includes('الطبلاوي')) return 91;
  if (name.includes('ismaeel') || ar.includes('إسماعيل')) return 88;
  if (name.includes('qasim') || ar.includes('القاسم')) return 11;
  if (name.includes('basit') || ar.includes('عبد الباسط')) return 2;

  return null;
}

export const ALL_RECITERS: ReciterItem[] = [
  {
    "id": 1,
    "nameArabic": "إبراهيم الأخضر",
    "name": "Ibrahim Al-Akdar",
    "server": "https://server6.mp3quran.net/akdr/",
    "surahTotal": 114
  },
  {
    "id": 10,
    "nameArabic": "أكرم العلاقمي",
    "name": "Akram Alalaqmi",
    "server": "https://server9.mp3quran.net/akrm/",
    "surahTotal": 114
  },
  {
    "id": 100,
    "nameArabic": "ماجد العنزي",
    "name": "Majed Al-Enezi",
    "server": "https://server8.mp3quran.net/majd_onazi/",
    "surahTotal": 113,
    "surahList": "1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 102,
    "nameArabic": "ماهر المعيقلي",
    "name": "Maher Al Meaqli",
    "server": "https://server12.mp3quran.net/maher/Almusshaf-Al-Mojawwad/",
    "surahTotal": 114
  },
  {
    "id": 104,
    "nameArabic": "محمد الأيراوي",
    "name": "Mohammad Al-Airawy",
    "server": "https://server6.mp3quran.net/earawi/",
    "surahTotal": 111,
    "surahList": "1,2,3,4,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 105,
    "nameArabic": "محمد البراك",
    "name": "Mohammed Al-Barrak",
    "server": "https://server13.mp3quran.net/braak/",
    "surahTotal": 63,
    "surahList": "1,12,14,36,37,44,45,50,51,52,53,54,55,56,57,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 106,
    "nameArabic": "محمد الطبلاوي",
    "name": "Mohammad Al-Tablaway",
    "server": "https://server12.mp3quran.net/tblawi/Al-Mojawwad/",
    "surahTotal": 114
  },
  {
    "id": 107,
    "nameArabic": "محمد اللحيدان",
    "name": "Mohammed Al-Lohaidan",
    "server": "https://server8.mp3quran.net/lhdan/",
    "surahTotal": 114
  },
  {
    "id": 108,
    "nameArabic": "محمد المحيسني",
    "name": "Mohammed Al-Muhasny",
    "server": "https://server11.mp3quran.net/mhsny/",
    "surahTotal": 114
  },
  {
    "id": 109,
    "nameArabic": "محمد أيوب",
    "name": "Mohammed Ayyub",
    "server": "https://server16.mp3quran.net/ayyoub2/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 11,
    "nameArabic": "الحسيني العزازي",
    "name": "Alhusayni Al-Azazi",
    "server": "https://server8.mp3quran.net/3zazi/",
    "surahTotal": 57,
    "surahList": "58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 110,
    "nameArabic": "محمد صالح عالم شاه",
    "name": "Mohammad Saleh Alim Shah",
    "server": "https://server12.mp3quran.net/shah/",
    "surahTotal": 114
  },
  {
    "id": 111,
    "nameArabic": "محمد جبريل",
    "name": "Mohammed Jibreel",
    "server": "https://server8.mp3quran.net/jbrl/",
    "surahTotal": 114
  },
  {
    "id": 112,
    "nameArabic": "محمد صديق المنشاوي",
    "name": "Mohammed Siddiq Al-Minshawi",
    "server": "https://server10.mp3quran.net/minsh/Almusshaf-Al-Mo-lim/",
    "surahTotal": 114
  },
  {
    "id": 115,
    "nameArabic": "محمد عبدالكريم",
    "name": "Mohammad Abdullkarem",
    "server": "https://server12.mp3quran.net/m_krm/Rewayat-Warsh-A-n-Nafi-Men-Tariq-Abi-Baker-Alasbahani/",
    "surahTotal": 114
  },
  {
    "id": 116,
    "nameArabic": "محمد عبدالحكيم سعيد العبدالله",
    "name": "Mohammad Al-Abdullah",
    "server": "https://server9.mp3quran.net/abdullah/Rewayat-AlDorai-A-n-Al-Kisa-ai/",
    "surahTotal": 114
  },
  {
    "id": 118,
    "nameArabic": "محمود خليل الحصري",
    "name": "Mahmoud Khalil Al-Hussary",
    "server": "https://server13.mp3quran.net/husr/Rewayat-Qalon-A-n-Nafi/",
    "surahTotal": 114
  },
  {
    "id": 12,
    "nameArabic": "إدريس أبكر",
    "name": "Idrees Abkr",
    "server": "https://server6.mp3quran.net/abkr/",
    "surahTotal": 114
  },
  {
    "id": 121,
    "nameArabic": "محمود علي البنا",
    "name": "Mahmoud Ali  Albanna",
    "server": "https://server8.mp3quran.net/bna/Almusshaf-Al-Mojawwad/",
    "surahTotal": 114
  },
  {
    "id": 123,
    "nameArabic": "مشاري العفاسي",
    "name": "Mishary Alafasi",
    "server": "https://server8.mp3quran.net/afs/",
    "surahTotal": 114
  },
  {
    "id": 125,
    "nameArabic": "مصطفى إسماعيل",
    "name": "Mustafa Ismail",
    "server": "https://server8.mp3quran.net/mustafa/Almusshaf-Al-Mojawwad/",
    "surahTotal": 114
  },
  {
    "id": 126,
    "nameArabic": "مصطفى اللاهوني",
    "name": "Mustafa Al-Lahoni",
    "server": "https://server6.mp3quran.net/lahoni/",
    "surahTotal": 114
  },
  {
    "id": 127,
    "nameArabic": "مصطفى رعد العزاوي",
    "name": "Mustafa raad Alazawy",
    "server": "https://server8.mp3quran.net/ra3ad/",
    "surahTotal": 114
  },
  {
    "id": 128,
    "nameArabic": "معمر الأندونيسي",
    "name": "Muamar (From Indonesia)",
    "server": "https://server6.mp3quran.net/muamr/",
    "surahTotal": 8,
    "surahList": "36,93,94,97,101,109,110,111"
  },
  {
    "id": 129,
    "nameArabic": "مفتاح السلطني",
    "name": "Muftah Alsaltany",
    "server": "https://server14.mp3quran.net/muftah_sultany/Rewayat_Ibn-Thakwan-A-n-Ibn-Amer/",
    "surahTotal": 114
  },
  {
    "id": 13,
    "nameArabic": "الزين محمد أحمد",
    "name": "Alzain Mohammad Ahmad",
    "server": "https://server9.mp3quran.net/alzain/",
    "surahTotal": 114
  },
  {
    "id": 134,
    "nameArabic": "محمد سايد",
    "name": "Mohammad Saayed",
    "server": "https://server16.mp3quran.net/m_sayed/Rewayat-Warsh-A-n-Nafi/",
    "surahTotal": 114
  },
  {
    "id": 135,
    "nameArabic": "عبدالرحمن السويّد",
    "name": "Abdulrahman Alsuwayid",
    "server": "https://server16.mp3quran.net/a_swaiyd/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 113,
    "surahList": "1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 136,
    "nameArabic": "عبدالإله بن عون",
    "name": "Abdulelah bin Aoun",
    "server": "https://server16.mp3quran.net/a_binaoun/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 137,
    "nameArabic": "أحمد طالب بن حميد",
    "name": "Ahmad Talib bin Humaid",
    "server": "https://server16.mp3quran.net/a_binhameed/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 107,
    "surahList": "1,2,3,4,5,6,7,8,10,11,12,13,15,18,19,20,21,22,25,26,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 138,
    "nameArabic": "نورين محمد صديق",
    "name": "Noreen Mohammad Siddiq",
    "server": "https://server16.mp3quran.net/nourin_siddig/Rewayat-Aldori-A-n-Abi-Amr/",
    "surahTotal": 114
  },
  {
    "id": 139,
    "nameArabic": "ماجد الزامل",
    "name": "Majed Al-Zamil",
    "server": "https://server9.mp3quran.net/zaml/",
    "surahTotal": 114
  },
  {
    "id": 14,
    "nameArabic": "القارئ ياسين",
    "name": "Al-Qaria Yassen",
    "server": "https://server11.mp3quran.net/qari/",
    "surahTotal": 114
  },
  {
    "id": 149,
    "nameArabic": "ماهر شخاشيرو",
    "name": "Maher Shakhashero",
    "server": "https://server10.mp3quran.net/shaksh/",
    "surahTotal": 114
  },
  {
    "id": 15,
    "nameArabic": "العشري عمران",
    "name": "Alashri Omran",
    "server": "https://server9.mp3quran.net/omran/",
    "surahTotal": 113,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 150,
    "nameArabic": "محمد المنشد",
    "name": "Mohammad AlMonshed",
    "server": "https://server10.mp3quran.net/monshed/",
    "surahTotal": 110,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,80,81,82,83,84,85,86,87,88,90,91,92,93,94,95,96,97,98,99,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 151,
    "nameArabic": "محمود الشيمي",
    "name": "Mahmood AlSheimy",
    "server": "https://server10.mp3quran.net/sheimy/",
    "surahTotal": 114
  },
  {
    "id": 152,
    "nameArabic": "ياسر سلامة",
    "name": "Yasser Salamah",
    "server": "https://server12.mp3quran.net/salamah/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 153,
    "nameArabic": "أخيل عبدالحي روا",
    "name": "Akhil Abdulhayy Rawa",
    "server": "https://server12.mp3quran.net/malaysia/akil/",
    "surahTotal": 4,
    "surahList": "50,51,52,56"
  },
  {
    "id": 154,
    "nameArabic": "أستاذ زامري",
    "name": "Ustaz Zamri",
    "server": "https://server12.mp3quran.net/malaysia/zamri/",
    "surahTotal": 7,
    "surahList": "32,44,55,56,61,67,76"
  },
  {
    "id": 159,
    "nameArabic": "خالد المهنا",
    "name": "Khalid Almohana",
    "server": "https://server11.mp3quran.net/mohna/",
    "surahTotal": 114
  },
  {
    "id": 16,
    "nameArabic": "العيون الكوشي",
    "name": "Aloyoon Al-Koshi",
    "server": "https://server11.mp3quran.net/koshi/",
    "surahTotal": 114
  },
  {
    "id": 160,
    "nameArabic": "عادل الكلباني",
    "name": "Adel Al-Khalbany",
    "server": "https://server8.mp3quran.net/a_klb/",
    "surahTotal": 114
  },
  {
    "id": 161,
    "nameArabic": "موسى بلال",
    "name": "Mousa Bilal",
    "server": "https://server11.mp3quran.net/bilal/",
    "surahTotal": 114
  },
  {
    "id": 162,
    "nameArabic": "حسين آل الشيخ",
    "name": "Hussain Alshaik",
    "server": "https://server11.mp3quran.net/alshaik/",
    "surahTotal": 59,
    "surahList": "2,8,13,14,22,32,36,38,44,45,49,50,54,55,56,57,62,63,64,65,66,72,73,75,76,77,78,79,80,81,82,85,87,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 163,
    "nameArabic": "حاتم فريد الواعر",
    "name": "Hatem Fareed Alwaer",
    "server": "https://server11.mp3quran.net/hatem/",
    "surahTotal": 114
  },
  {
    "id": 164,
    "nameArabic": "إبراهيم الجرمي",
    "name": "Ibrahim Aljormy",
    "server": "https://server11.mp3quran.net/jormy/",
    "surahTotal": 114
  },
  {
    "id": 165,
    "nameArabic": "محمود الرفاعي",
    "name": "Mahmood Al rifai",
    "server": "https://server11.mp3quran.net/mrifai/",
    "surahTotal": 114
  },
  {
    "id": 166,
    "nameArabic": "ناصر العبيد",
    "name": "Nasser Al obaid",
    "server": "https://server11.mp3quran.net/obaid/",
    "surahTotal": 67,
    "surahList": "3,7,10,13,14,15,19,21,25,26,27,32,35,36,37,38,39,40,41,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 167,
    "nameArabic": "واصل المذن",
    "name": "Wasel Almethen",
    "server": "https://server11.mp3quran.net/wasel/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 9,
    "surahList": "8,9,36,38,42,45,50,59,60"
  },
  {
    "id": 17,
    "nameArabic": "توفيق الصايغ",
    "name": "Tawfeeq As-Sayegh",
    "server": "https://server6.mp3quran.net/twfeeq/",
    "surahTotal": 114
  },
  {
    "id": 178,
    "nameArabic": "إبراهيم الدوسري",
    "name": "Ibrahim Aldosari",
    "server": "https://server10.mp3quran.net/ibrahim_dosri/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 18,
    "nameArabic": "جمال شاكر عبدالله",
    "name": "Jamal Shaker Abdullah",
    "server": "https://server6.mp3quran.net/jamal/",
    "surahTotal": 114
  },
  {
    "id": 181,
    "nameArabic": "جمعان العصيمي",
    "name": "Jamaan Alosaimi",
    "server": "https://server6.mp3quran.net/jaman/",
    "surahTotal": 114
  },
  {
    "id": 183,
    "nameArabic": "رضية عبدالرحمن",
    "name": "Rodziah Abdulrahman",
    "server": "https://server12.mp3quran.net/malaysia/rziah/",
    "surahTotal": 4,
    "surahList": "3,8,33,35"
  },
  {
    "id": 184,
    "nameArabic": "رقية سولونق",
    "name": "Rogayah Sulong",
    "server": "https://server12.mp3quran.net/malaysia/rogiah/",
    "surahTotal": 1,
    "surahList": "36"
  },
  {
    "id": 185,
    "nameArabic": "سابينة مامات",
    "name": "Sapinah Mamat",
    "server": "https://server12.mp3quran.net/malaysia/mamat/",
    "surahTotal": 4,
    "surahList": "3,14,21,22"
  },
  {
    "id": 187,
    "nameArabic": "سيدين عبدالرحمن",
    "name": "Saidin Abdulrahman",
    "server": "https://server12.mp3quran.net/malaysia/sideen/",
    "surahTotal": 4,
    "surahList": "17,23,56,75"
  },
  {
    "id": 188,
    "nameArabic": "عبدالغني عبدالله",
    "name": "Abdulghani Abdullah",
    "server": "https://server12.mp3quran.net/malaysia/abdulgani/",
    "surahTotal": 13,
    "surahList": "1,2,5,6,9,67,87,91,92,94,95,97,114"
  },
  {
    "id": 189,
    "nameArabic": "عبدالله فهمي",
    "name": "Abdullah Fahmi",
    "server": "https://server12.mp3quran.net/malaysia/fhmi/",
    "surahTotal": 4,
    "surahList": "1,36,53,75"
  },
  {
    "id": 19,
    "nameArabic": "حمد الدغريري",
    "name": "Hamad Al Daghriri",
    "server": "https://server6.mp3quran.net/hamad/",
    "surahTotal": 88,
    "surahList": "1,2,12,13,19,21,23,27,29,31,36,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 190,
    "nameArabic": "محمد الحافظ",
    "name": "Muhammad Al-Hafiz",
    "server": "https://server12.mp3quran.net/malaysia/hafz/",
    "surahTotal": 3,
    "surahList": "1,19,31"
  },
  {
    "id": 191,
    "nameArabic": "محمد حفص علي",
    "name": "Mohammed Hafas Ali",
    "server": "https://server12.mp3quran.net/malaysia/hfs/",
    "surahTotal": 5,
    "surahList": "1,9,11,13,67"
  },
  {
    "id": 192,
    "nameArabic": "محمد خير النور",
    "name": "Muhammed Khairul Anuar",
    "server": "https://server12.mp3quran.net/malaysia/nor/",
    "surahTotal": 4,
    "surahList": "1,12,19,31"
  },
  {
    "id": 193,
    "nameArabic": "يوسف بن نوح أحمد",
    "name": "Yousef Bin Noah Ahmad",
    "server": "https://server8.mp3quran.net/noah/",
    "surahTotal": 114
  },
  {
    "id": 194,
    "nameArabic": "جمال الدين الزيلعي",
    "name": "Jamal Addeen Alzailaie",
    "server": "https://server11.mp3quran.net/zilaie/",
    "surahTotal": 8,
    "surahList": "1,19,32,54,67,70,73,91"
  },
  {
    "id": 197,
    "nameArabic": "معيض الحارثي",
    "name": "Moeedh Alharthi",
    "server": "https://server8.mp3quran.net/harthi/",
    "surahTotal": 114
  },
  {
    "id": 198,
    "nameArabic": "محمد رشاد الشريف",
    "name": "Mohammad Rashad Alshareef",
    "server": "https://server10.mp3quran.net/rashad/",
    "surahTotal": 114
  },
  {
    "id": 2,
    "nameArabic": "إبراهيم الجبرين",
    "name": "Ibrahim Al-Jebreen",
    "server": "https://server6.mp3quran.net/jbreen/",
    "surahTotal": 107,
    "surahList": "1,2,3,4,6,7,8,10,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,30,31,32,33,34,35,36,37,38,39,40,41,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 20,
    "nameArabic": "خالد الجليل",
    "name": "Khalid Al-Jileel",
    "server": "https://server10.mp3quran.net/jleel/",
    "surahTotal": 114
  },
  {
    "id": 201,
    "nameArabic": "أحمد الطرابلسي",
    "name": "Ahmed Al-trabulsi",
    "server": "https://server10.mp3quran.net/trabulsi/",
    "surahTotal": 114
  },
  {
    "id": 202,
    "nameArabic": "عبدالله الكندري",
    "name": "Abdullah Al-Kandari",
    "server": "https://server10.mp3quran.net/Abdullahk/",
    "surahTotal": 114
  },
  {
    "id": 203,
    "nameArabic": "أحمد عامر",
    "name": "Ahmed Amer",
    "server": "https://server10.mp3quran.net/Aamer/",
    "surahTotal": 114
  },
  {
    "id": 204,
    "nameArabic": "إبراهيم السعدان",
    "name": "Ibrahem Assadan",
    "server": "https://server10.mp3quran.net/IbrahemSadan/",
    "surahTotal": 50,
    "surahList": "1,4,5,6,7,8,9,11,12,15,16,19,20,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 205,
    "nameArabic": "أحمد الحذيفي",
    "name": "Ahmad Alhuthaifi",
    "server": "https://server8.mp3quran.net/ahmad_huth/",
    "surahTotal": 110,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,34,35,36,38,39,41,42,43,44,45,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 206,
    "nameArabic": "محمد عثمان خان",
    "name": "Mohammed Osman Khan",
    "server": "https://server6.mp3quran.net/khan/",
    "surahTotal": 114
  },
  {
    "id": 207,
    "nameArabic": "يوسف الدغوش",
    "name": "Youssef Edghouch",
    "server": "https://server7.mp3quran.net/dgsh/",
    "surahTotal": 26,
    "surahList": "1,3,55,67,71,73,75,78,82,85,87,88,90,91,92,100,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 208,
    "nameArabic": "الدوكالي محمد العالم",
    "name": "Addokali Mohammad Alalim",
    "server": "https://server7.mp3quran.net/dokali/",
    "surahTotal": 114
  },
  {
    "id": 209,
    "nameArabic": "وشيار حيدر اربيلي",
    "name": "Wishear Hayder Arbili",
    "server": "https://server11.mp3quran.net/wishear/",
    "surahTotal": 2,
    "surahList": "55,56"
  },
  {
    "id": 21,
    "nameArabic": "خالد القحطاني",
    "name": "Khaled Al-Qahtani",
    "server": "https://server10.mp3quran.net/qht/",
    "surahTotal": 114
  },
  {
    "id": 211,
    "nameArabic": "الفاتح محمد الزبير",
    "name": "Alfateh Alzubair",
    "server": "https://server6.mp3quran.net/fateh/",
    "surahTotal": 114
  },
  {
    "id": 21136,
    "nameArabic": "عبدالله القرافي",
    "name": "Abdullah Alqarafi",
    "server": "https://server16.mp3quran.net/a_alqrafi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21148,
    "nameArabic": "عبدالبديع غيلان",
    "name": "Abdulbadi Ghailan",
    "server": "https://server16.mp3quran.net/A-Ghailan/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21181,
    "nameArabic": "محمد برهجي",
    "name": "Muhammad Burhaji",
    "server": "https://server16.mp3quran.net/M_Burhaji/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21182,
    "nameArabic": "يوسف العيدروس",
    "name": "Yusuf ALaidroos",
    "server": "https://server16.mp3quran.net/Y_ALaidroos/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21183,
    "nameArabic": "حسن الدغريري",
    "name": "Hassan Aldaghriri",
    "server": "https://server16.mp3quran.net/H-Aldaghriri/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21184,
    "nameArabic": "محمد الفقيه",
    "name": "Muhammad Al Faqih",
    "server": "https://server16.mp3quran.net/M_Alfaqih/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21186,
    "nameArabic": "جنيد آدم عبدالله",
    "name": "Junaid Adam Abdullah",
    "server": "https://server16.mp3quran.net/J-Abdullah/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21187,
    "nameArabic": "خالد الزيادي",
    "name": "Khalid Alziyadi",
    "server": "https://server16.mp3quran.net/K-Alzadi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21188,
    "nameArabic": "الوليد الشمسان",
    "name": "Alwaleed Alshamsan",
    "server": "https://server14.mp3quran.net/shamsan/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 71,
    "surahList": "1,8,17,19,20,24,25,26,29,30,31,32,33,35,36,37,41,42,43,44,45,47,48,49,50,51,52,53,54,55,56,57,58,59,60,62,63,64,65,66,67,68,70,75,76,81,82,85,86,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 21191,
    "nameArabic": "إبراهيم الشهري",
    "name": "Ibrahim Al-Shahri",
    "server": "https://server16.mp3quran.net/Ibrahim-Al-Shahri/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 113,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 21193,
    "nameArabic": "عبدالرحمن بن عبدالرزاق البدر",
    "name": "Abdul Rahman bin Abdul Razzaq Al Badr",
    "server": "https://server16.mp3quran.net/A-AlBadr/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21196,
    "nameArabic": "عليجان قوري حمدان",
    "name": "Alijon Qori",
    "server": "https://server16.mp3quran.net/Alijon/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21197,
    "nameArabic": "محمد الزبيدي",
    "name": "Mohammed Al-Zubaidi",
    "server": "https://server16.mp3quran.net/M-AlZubaidi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21199,
    "nameArabic": "عبد المجيب بنكيران",
    "name": "Abdelmoujib Benkirane",
    "server": "https://server16.mp3quran.net/A-Benkirane/Rewayat-Warsh-A-n-Nafi/",
    "surahTotal": 114
  },
  {
    "id": 212,
    "nameArabic": "طارق عبدالغني دعوب",
    "name": "Tareq Abdulgani daawob",
    "server": "https://server10.mp3quran.net/tareq/",
    "surahTotal": 114
  },
  {
    "id": 21201,
    "nameArabic": "عاصم اللحیدان",
    "name": "Asim Al-Luhaidan",
    "server": "https://server7.mp3quran.net/asim/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 21202,
    "nameArabic": "محمود حرفوش",
    "name": "Mahmoud Harfoush",
    "server": "https://server16.mp3quran.net/M-Harfoush/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 216,
    "nameArabic": "عثمان الأنصاري",
    "name": "Othman Al-Ansary",
    "server": "https://server11.mp3quran.net/Othmn/",
    "surahTotal": 76,
    "surahList": "1,2,3,4,5,6,7,40,41,42,43,44,46,47,48,49,50,51,52,53,54,55,56,58,59,60,61,62,63,64,65,66,67,68,69,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 217,
    "nameArabic": "بندر بليله",
    "name": "Bandar Balilah",
    "server": "https://server6.mp3quran.net/balilah/",
    "surahTotal": 114
  },
  {
    "id": 218,
    "nameArabic": "خالد الشريمي",
    "name": "Khalid Al-Shoraimy",
    "server": "https://server12.mp3quran.net/shoraimy/",
    "surahTotal": 73,
    "surahList": "1,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 219,
    "nameArabic": "وديع اليمني",
    "name": "Wadeea Al-Yamani",
    "server": "https://server6.mp3quran.net/wdee3/",
    "surahTotal": 114
  },
  {
    "id": 22,
    "nameArabic": "خالد عبدالكافي",
    "name": "Khalid Abdulkafi",
    "server": "https://server11.mp3quran.net/kafi/",
    "surahTotal": 114
  },
  {
    "id": 221,
    "nameArabic": "رعد محمد الكردي",
    "name": "Raad Al Kurdi",
    "server": "https://server6.mp3quran.net/kurdi/",
    "surahTotal": 114
  },
  {
    "id": 225,
    "nameArabic": "عبدالرحمن العوسي",
    "name": "Abdulrahman Aloosi",
    "server": "https://server6.mp3quran.net/aloosi/",
    "surahTotal": 114
  },
  {
    "id": 226,
    "nameArabic": "خالد الغامدي",
    "name": "Khalid Algamdi",
    "server": "https://server6.mp3quran.net/ghamdi/",
    "surahTotal": 102,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,39,40,41,42,43,45,46,47,49,50,51,52,53,54,55,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,73,75,76,77,80,82,83,85,86,87,88,89,90,91,92,93,94,95,97,98,99,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 227,
    "nameArabic": "رمضان شكور",
    "name": "Ramadan Shakoor",
    "server": "https://server6.mp3quran.net/shakoor/",
    "surahTotal": 65,
    "surahList": "1,2,3,9,10,12,13,14,23,24,26,29,35,36,39,40,42,43,47,48,49,50,51,57,58,59,60,63,68,69,70,71,72,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,111,112,113,114"
  },
  {
    "id": 228,
    "nameArabic": "عبدالمجيد الأركاني",
    "name": "Abdulmajeed Al-Arkani",
    "server": "https://server7.mp3quran.net/m_arkani/",
    "surahTotal": 49,
    "surahList": "1,12,14,15,18,19,21,22,40,50,56,76,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 229,
    "nameArabic": "محمد خليل القارئ",
    "name": "Mohammad Khalil Al-Qari",
    "server": "https://server8.mp3quran.net/m_qari/",
    "surahTotal": 114
  },
  {
    "id": 23,
    "nameArabic": "خالد الوهيبي",
    "name": "Khalid Al-Wehabi",
    "server": "https://server11.mp3quran.net/whabi/",
    "surahTotal": 25,
    "surahList": "1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,24,25,29,30,31,32"
  },
  {
    "id": 230,
    "nameArabic": "رامي الدعيس",
    "name": "Rami Aldeais",
    "server": "https://server6.mp3quran.net/rami/",
    "surahTotal": 114
  },
  {
    "id": 231,
    "nameArabic": "هزاع البلوشي",
    "name": "Hazza Al-Balushi",
    "server": "https://server11.mp3quran.net/hazza/",
    "surahTotal": 91,
    "surahList": "1,6,8,12,13,14,15,17,18,19,20,21,22,25,29,30,31,32,34,35,36,37,38,39,40,41,42,43,44,45,46,47,49,50,51,52,53,54,55,56,57,61,63,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 236,
    "nameArabic": "عبدالرحمن الماجد",
    "name": "Abdulrahman Al-Majed",
    "server": "https://server10.mp3quran.net/a_majed/",
    "surahTotal": 114
  },
  {
    "id": 237,
    "nameArabic": "مروان العكري",
    "name": "Marwan Alakri",
    "server": "https://server16.mp3quran.net/m_akri/Rewayat-Qalon-A-n-Nafi/",
    "surahTotal": 114
  },
  {
    "id": 24,
    "nameArabic": "خليفة الطنيجي",
    "name": "Khalifa Altunaiji",
    "server": "https://server12.mp3quran.net/tnjy/",
    "surahTotal": 114
  },
  {
    "id": 240,
    "nameArabic": "سلمان العتيبي",
    "name": "Salman Alotaibi",
    "server": "https://server11.mp3quran.net/salman/",
    "surahTotal": 76,
    "surahList": "1,2,3,10,11,14,16,19,23,25,32,36,38,39,40,46,48,50,52,55,56,58,59,61,62,63,64,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 241,
    "nameArabic": "محمد رفعت",
    "name": "Mohammad Refat",
    "server": "https://server14.mp3quran.net/refat/",
    "surahTotal": 31,
    "surahList": "1,10,11,12,17,18,19,20,48,54,55,56,69,72,73,75,76,77,78,79,81,82,83,85,86,87,88,89,96,98,100"
  },
  {
    "id": 243,
    "nameArabic": "عبدالله الموسى",
    "name": "Abdullah Al-Mousa",
    "server": "https://server14.mp3quran.net/mousa/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 244,
    "nameArabic": "عبدالله الخلف",
    "name": "Abdullah Al-Khalaf",
    "server": "https://server14.mp3quran.net/khalf/",
    "surahTotal": 114
  },
  {
    "id": 245,
    "nameArabic": "منصور السالمي",
    "name": "Mansour Al-Salemi",
    "server": "https://server14.mp3quran.net/mansor/",
    "surahTotal": 114
  },
  {
    "id": 246,
    "nameArabic": "صلاح مصلي",
    "name": "Salah Musali",
    "server": "https://server14.mp3quran.net/musali/",
    "surahTotal": 49,
    "surahList": "50,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 247,
    "nameArabic": "خالد الشارخ",
    "name": "Khalid Alsharekh",
    "server": "https://server14.mp3quran.net/sharekh/",
    "surahTotal": 64,
    "surahList": "2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 248,
    "nameArabic": "ناصر العصفور",
    "name": "Nasser Alosfor",
    "server": "https://server14.mp3quran.net/alosfor/",
    "surahTotal": 114
  },
  {
    "id": 25,
    "nameArabic": "داود حمزة",
    "name": "Dawood Hamza",
    "server": "https://server9.mp3quran.net/hamza/",
    "surahTotal": 114
  },
  {
    "id": 250,
    "nameArabic": "محمد البخيت",
    "name": "Mohammad Albukheet",
    "server": "https://server14.mp3quran.net/bukheet/",
    "surahTotal": 114
  },
  {
    "id": 251,
    "nameArabic": "ناصر الماجد",
    "name": "Nasser Almajed",
    "server": "https://server14.mp3quran.net/nasser_almajed/",
    "surahTotal": 114
  },
  {
    "id": 252,
    "nameArabic": "أحمد السويلم",
    "name": "Ahmed Al-Swailem",
    "server": "https://server14.mp3quran.net/swlim/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 253,
    "nameArabic": "إسلام صبحي",
    "name": "Islam Sobhi",
    "server": "https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 109,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,38,41,42,43,44,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 254,
    "nameArabic": "بدر التركي",
    "name": "Bader Alturki",
    "server": "https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 255,
    "nameArabic": "هيثم الجدعاني",
    "name": "Hitham Aljadani",
    "server": "https://server16.mp3quran.net/hitham/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 101,
    "surahList": "1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,19,20,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,61,62,63,64,67,68,69,70,72,75,76,77,78,79,80,81,82,83,84,85,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 256,
    "nameArabic": "أحمد خليل شاهين",
    "name": "Ahmad Shaheen",
    "server": "https://server16.mp3quran.net/shaheen/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 257,
    "nameArabic": "سعد المقرن",
    "name": "Saad Almqren",
    "server": "https://server16.mp3quran.net/saad/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 259,
    "nameArabic": "أحمد النفيس",
    "name": "Ahmad Al Nufais",
    "server": "https://server16.mp3quran.net/nufais/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 26,
    "nameArabic": "رشيد إفراد",
    "name": "Rasheed Ifrad",
    "server": "https://server12.mp3quran.net/ifrad/",
    "surahTotal": 50,
    "surahList": "1,3,12,13,14,18,20,22,23,25,26,27,28,29,30,31,33,34,35,36,37,38,39,40,41,42,43,46,47,48,49,51,67,68,69,70,71,74,75,79,82,86,87,88,89,93,94,104,109,112"
  },
  {
    "id": 260,
    "nameArabic": "عمر الدريويز",
    "name": "Omar Al Darweez",
    "server": "https://server16.mp3quran.net/darweez/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 263,
    "nameArabic": "عبدالعزيز العسيري",
    "name": "Abdulaziz Alasiri",
    "server": "https://server16.mp3quran.net/abdulazizasiri/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 72,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30,31,32,35,36,37,39,40,41,45,49,50,51,52,53,54,55,56,57,63,66,67,69,70,71,72,73,75,76,77,78,80,81,83,86,87,88,89,93,99,101,107,110,112"
  },
  {
    "id": 264,
    "nameArabic": "يونس اسويلص",
    "name": "Younes Souilass",
    "server": "https://server16.mp3quran.net/souilass/Rewayat-Warsh-A-n-Nafi/",
    "surahTotal": 65,
    "surahList": "1,2,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,50,51,52,53,54,56,57,67,71,73,76,77,78,79,80,81,82,86,89,90,91,93,95,97,112"
  },
  {
    "id": 265,
    "nameArabic": "أحمد ديبان",
    "name": "Ahmad Deban",
    "server": "https://server16.mp3quran.net/deban/Rewayat-Warsh-A-n-Nafi-Men-Tariq-Alazraq/",
    "surahTotal": 114
  },
  {
    "id": 267,
    "nameArabic": "عبدالله كامل",
    "name": "Abdullah Kamel",
    "server": "https://server16.mp3quran.net/kamel/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 268,
    "nameArabic": "بيشه وا قادر الكردي",
    "name": "Peshawa Qadr Al-Kurdi",
    "server": "https://server16.mp3quran.net/peshawa/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 27,
    "nameArabic": "رشيد بلعالية",
    "name": "Rachid Belalya",
    "server": "https://server6.mp3quran.net/bl3/Rewayat-Warsh-A-n-Nafi/",
    "surahTotal": 114
  },
  {
    "id": 271,
    "nameArabic": "نذير المالكي",
    "name": "Nathier Almalki",
    "server": "https://server16.mp3quran.net//nathier/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 272,
    "nameArabic": "عكاشة كميني",
    "name": "Okasha Kameny",
    "server": "https://server16.mp3quran.net/okasha/Rewayat-Albizi-A-n-Ibn-Katheer/",
    "surahTotal": 114
  },
  {
    "id": 273,
    "nameArabic": "هيثم الدخين",
    "name": "Haitham Aldukhain",
    "server": "https://server16.mp3quran.net/h_dukhain/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 274,
    "nameArabic": "محمد أبو سنينة",
    "name": "Muhammad Abu Sneina",
    "server": "https://server16.mp3quran.net/sneineh/Rewayat-Qalon-A-n-Nafi/",
    "surahTotal": 114
  },
  {
    "id": 275,
    "nameArabic": "محمد الأمين قنيوة",
    "name": "Mohammed Al-Amin Qeniwa",
    "server": "https://server16.mp3quran.net/qeniwa/Rewayat-Qalon-A-n-Nafi/",
    "surahTotal": 114
  },
  {
    "id": 277,
    "nameArabic": "محمود عبدالحكم",
    "name": "Mahmoud Abdul Hakam",
    "server": "https://server16.mp3quran.net/m_abdelhakam/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 278,
    "nameArabic": "أحمد عيسى المعصراوي",
    "name": "Ahmad Issa Al Maasaraawi",
    "server": "https://server16.mp3quran.net/a_maasaraawi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 279,
    "nameArabic": "إبراهيم كشيدان",
    "name": "Ibrahim Kshidan",
    "server": "https://server16.mp3quran.net/i_kshidan/Rewayat-Qalon-A-n-Nafi/",
    "surahTotal": 114
  },
  {
    "id": 28,
    "nameArabic": "زكريا حمامة",
    "name": "Zakaria Hamamah",
    "server": "https://server9.mp3quran.net/zakariya/",
    "surahTotal": 7,
    "surahList": "32,36,44,56,67,76,85"
  },
  {
    "id": 280,
    "nameArabic": "هاشم أبو دلال",
    "name": "Hashim Abu Dalal",
    "server": "https://server16.mp3quran.net/h_abudalal/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 281,
    "nameArabic": "فؤاد الخامري",
    "name": "Fouad Alkhamery",
    "server": "https://server16.mp3quran.net/f_khamery/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 282,
    "nameArabic": "سيد أحمد هاشمي",
    "name": "Sayed Ahmad Hashemi",
    "server": "https://server16.mp3quran.net/s_hashemi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 283,
    "nameArabic": "خالد كريم محمدي",
    "name": "Khalid Mohammadi",
    "server": "https://server16.mp3quran.net/kh_mohammadi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 284,
    "nameArabic": "مال الله عبدالرحمن الجابر",
    "name": "Mal-Allah Abdulrhman Aljaber",
    "server": "https://server16.mp3quran.net/mal-allah_jaber/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 285,
    "nameArabic": "سلمان الصديق",
    "name": "Salman Alsadeiq",
    "server": "https://server16.mp3quran.net/s_sadeiq/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 286,
    "nameArabic": "حسن صالح",
    "name": "Hasan Saleh",
    "server": "https://server16.mp3quran.net/h_saleh/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 287,
    "nameArabic": "عبدالرحمن الشحات",
    "name": "Abdulrahman Alshahhat",
    "server": "https://server16.mp3quran.net/a_alshahhat/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 288,
    "nameArabic": "عيسى عمر سناكو",
    "name": "Issa Omar Sanankoua",
    "server": "https://server16.mp3quran.net/i_sanankoua/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 289,
    "nameArabic": "هارون بقائي",
    "name": "Haroon Baqai",
    "server": "https://server16.mp3quran.net/h_baqai/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 51,
    "surahList": "1,56,62,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 29,
    "nameArabic": "عبدالله بخاري",
    "name": "Abdullah Bukhari",
    "server": "https://server16.mp3quran.net/a_bukhari/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 80,
    "surahList": "1,2,36,37,38,39,40,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 290,
    "nameArabic": "صالح القريشي",
    "name": "Saleh Alquraishi",
    "server": "https://server16.mp3quran.net/s_alquraishi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 3,
    "nameArabic": "إبراهيم العسيري",
    "name": "Ibrahim Al-Asiri",
    "server": "https://server6.mp3quran.net/3siri/",
    "surahTotal": 114
  },
  {
    "id": 30,
    "nameArabic": "سعد الغامدي",
    "name": "Saad Al-Ghamdi",
    "server": "https://server7.mp3quran.net/s_gmd/",
    "surahTotal": 114
  },
  {
    "id": 300,
    "nameArabic": "صالح الشمراني",
    "name": "Saleh Alshamrani",
    "server": "https://server16.mp3quran.net/shamrani/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 301,
    "nameArabic": "فيصل الهاجري",
    "name": "Faisal Al-Hajry",
    "server": "https://server16.mp3quran.net/f_hajry/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 302,
    "nameArabic": "أنس العمادي",
    "name": "Anas Alemadi",
    "server": "https://server16.mp3quran.net/a_alemadi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 303,
    "nameArabic": "عبدالملك العسكر",
    "name": "Abdulmalik Alaskar",
    "server": "https://server16.mp3quran.net/a_alaskar/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 7,
    "surahList": "30,36,40,69,70,71,75"
  },
  {
    "id": 304,
    "nameArabic": "عبدالكريم الحازمي",
    "name": "Abdulkareem Alhazmi",
    "server": "https://server16.mp3quran.net/a_alhazmi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 305,
    "nameArabic": "هشام الهراز",
    "name": "Hicham Lharraz",
    "server": "https://server16.mp3quran.net/H-Lharraz/Rewayat-Warsh-A-n-Nafi/",
    "surahTotal": 113,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 306,
    "nameArabic": "عبدالله المشعل",
    "name": "Abdullah Al-Mishal",
    "server": "https://server16.mp3quran.net/a-almishal/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 11,
    "surahList": "8,14,41,49,50,51,52,53,54,55,56"
  },
  {
    "id": 307,
    "nameArabic": "عبدالعزيز سحيم",
    "name": "Abdelaziz sheim",
    "server": "https://server16.mp3quran.net/a_sheim/Rewayat-Warsh-A-n-Nafi/",
    "surahTotal": 16,
    "surahList": "1,18,19,31,49,50,51,55,56,66,67,72,75,87,89,112"
  },
  {
    "id": 31,
    "nameArabic": "سعود الشريم",
    "name": "Saud Al-Shuraim",
    "server": "https://server7.mp3quran.net/shur/",
    "surahTotal": 114
  },
  {
    "id": 32,
    "nameArabic": "سهل ياسين",
    "name": "Sahl Yassin",
    "server": "https://server6.mp3quran.net/shl/",
    "surahTotal": 114
  },
  {
    "id": 33,
    "nameArabic": "زكي داغستاني",
    "name": "Zaki Daghistani",
    "server": "https://server9.mp3quran.net/zaki/",
    "surahTotal": 114
  },
  {
    "id": 34,
    "nameArabic": "سامي الحسن",
    "name": "Sami Al-Hasn",
    "server": "https://server8.mp3quran.net/sami_hsn/",
    "surahTotal": 28,
    "surahList": "1,19,20,24,26,27,32,34,50,55,81,82,86,87,88,91,92,93,94,95,97,102,104,105,109,110,111,112"
  },
  {
    "id": 35,
    "nameArabic": "سامي الدوسري",
    "name": "Sami Al-Dosari",
    "server": "https://server8.mp3quran.net/sami_dosr/",
    "surahTotal": 53,
    "surahList": "2,8,9,12,13,14,29,30,31,32,33,34,35,39,40,41,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 36,
    "nameArabic": "سيد رمضان",
    "name": "Sayeed Ramadan",
    "server": "https://server12.mp3quran.net/sayed/",
    "surahTotal": 114
  },
  {
    "id": 37,
    "nameArabic": "شعبان الصياد",
    "name": "Shaban Al-Sayiaad",
    "server": "https://server11.mp3quran.net/shaban/",
    "surahTotal": 65,
    "surahList": "2,3,4,5,6,7,9,10,11,12,13,16,17,19,20,21,22,24,26,27,28,29,32,33,35,38,40,41,42,43,45,46,47,52,53,54,59,60,67,68,69,77,78,79,80,81,82,87,88,89,90,91,92,94,95,96,97,98,99,100,101,102,103,104,105"
  },
  {
    "id": 38,
    "nameArabic": "شيرزاد عبدالرحمن طاهر",
    "name": "Shirazad Taher",
    "server": "https://server12.mp3quran.net/taher/",
    "surahTotal": 114
  },
  {
    "id": 39,
    "nameArabic": "صابر عبدالحكم",
    "name": "Saber Abdulhakm",
    "server": "https://server12.mp3quran.net/hkm/",
    "surahTotal": 114
  },
  {
    "id": 4,
    "nameArabic": "شيخ أبو بكر الشاطري",
    "name": "Shaik Abu Bakr Al Shatri",
    "server": "https://server11.mp3quran.net/shatri/",
    "surahTotal": 114
  },
  {
    "id": 40,
    "nameArabic": "صالح الصاهود",
    "name": "Saleh Alsahood",
    "server": "https://server8.mp3quran.net/sahood/",
    "surahTotal": 114
  },
  {
    "id": 41,
    "nameArabic": "صالح آل طالب",
    "name": "Saleh Al-Talib",
    "server": "https://server9.mp3quran.net/tlb/",
    "surahTotal": 33,
    "surahList": "1,2,25,34,38,39,44,45,46,47,55,56,57,58,59,60,61,70,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86"
  },
  {
    "id": 42,
    "nameArabic": "صالح الهبدان",
    "name": "Saleh Al-Habdan",
    "server": "https://server6.mp3quran.net/habdan/",
    "surahTotal": 114
  },
  {
    "id": 43,
    "nameArabic": "صلاح البدير",
    "name": "Salah Albudair",
    "server": "https://server6.mp3quran.net/s_bud/",
    "surahTotal": 114
  },
  {
    "id": 44,
    "nameArabic": "صلاح الهاشم",
    "name": "Salah Alhashim",
    "server": "https://server12.mp3quran.net/salah_hashim_m/",
    "surahTotal": 114
  },
  {
    "id": 46,
    "nameArabic": "صلاح بو خاطر",
    "name": "Slaah Bukhatir",
    "server": "https://server8.mp3quran.net/bu_khtr/",
    "surahTotal": 114
  },
  {
    "id": 47,
    "nameArabic": "مختار الحاج",
    "name": "Mukhtar Al-Haj",
    "server": "https://server16.mp3quran.net/mukhtar_haj/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 48,
    "nameArabic": "عادل ريان",
    "name": "Adel Ryyan",
    "server": "https://server8.mp3quran.net/ryan/",
    "surahTotal": 114
  },
  {
    "id": 49,
    "nameArabic": "عبدالبارئ الثبيتي",
    "name": "Abdelbari Al-Toubayti",
    "server": "https://server6.mp3quran.net/thubti/",
    "surahTotal": 114
  },
  {
    "id": 5,
    "nameArabic": "أحمد بن علي العجمي",
    "name": "Ahmad Al-Ajmy",
    "server": "https://server10.mp3quran.net/ajm/",
    "surahTotal": 114
  },
  {
    "id": 50,
    "nameArabic": "عبدالبارئ محمد",
    "name": "Abdulbari Mohammad",
    "server": "https://server12.mp3quran.net/bari/",
    "surahTotal": 114
  },
  {
    "id": 51,
    "nameArabic": "عبدالباسط عبدالصمد",
    "name": "Abdulbasit Abdulsamad",
    "server": "https://server7.mp3quran.net/basit/",
    "surahTotal": 114
  },
  {
    "id": 54,
    "nameArabic": "عبدالرحمن السديس",
    "name": "Abdulrahman Alsudaes",
    "server": "https://server11.mp3quran.net/sds/",
    "surahTotal": 114
  },
  {
    "id": 55,
    "nameArabic": "عبدالعزيز الأحمد",
    "name": "Abdul Aziz Al-Ahmad",
    "server": "https://server11.mp3quran.net/a_ahmed/",
    "surahTotal": 114
  },
  {
    "id": 56,
    "nameArabic": "عبدالعزيز الزهراني",
    "name": "Abdulaziz Az-Zahrani",
    "server": "https://server9.mp3quran.net/zahrani/",
    "surahTotal": 114
  },
  {
    "id": 57,
    "nameArabic": "عبدالله البريمي",
    "name": "Abdullah Al-Burimi",
    "server": "https://server8.mp3quran.net/brmi/",
    "surahTotal": 69,
    "surahList": "1,19,23,24,25,31,32,36,49,50,55,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 58,
    "nameArabic": "عبدالله البعيجان",
    "name": "Abdullah Albuajan",
    "server": "https://server8.mp3quran.net/buajan/",
    "surahTotal": 114
  },
  {
    "id": 59,
    "nameArabic": "عبدالله المطرود",
    "name": "Abdullah Al-Mattrod",
    "server": "https://server8.mp3quran.net/mtrod/",
    "surahTotal": 114
  },
  {
    "id": 6,
    "nameArabic": "أحمد الحواشي",
    "name": "Ahmad Al-Hawashi",
    "server": "https://server11.mp3quran.net/hawashi/",
    "surahTotal": 114
  },
  {
    "id": 60,
    "nameArabic": "عبدالله بصفر",
    "name": "Abdullah Basfer",
    "server": "https://server6.mp3quran.net/bsfr/",
    "surahTotal": 114
  },
  {
    "id": 61,
    "nameArabic": "عبدالله خياط",
    "name": "Abdullah Khayyat",
    "server": "https://server12.mp3quran.net/kyat/",
    "surahTotal": 114
  },
  {
    "id": 62,
    "nameArabic": "عبدالله عواد الجهني",
    "name": "Abdullah Al-Johany",
    "server": "https://server13.mp3quran.net/jhn/",
    "surahTotal": 114
  },
  {
    "id": 63,
    "nameArabic": "عبدالله غيلان",
    "name": "Abdullah Qaulan",
    "server": "https://server8.mp3quran.net/gulan/",
    "surahTotal": 114
  },
  {
    "id": 64,
    "nameArabic": "عبدالرشيد صوفي",
    "name": "Abdulrasheed Soufi",
    "server": "https://server16.mp3quran.net/soufi/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 66,
    "nameArabic": "عبدالمحسن الحارثي",
    "name": "Abdulmohsin Al-Harthy",
    "server": "https://server6.mp3quran.net/mohsin_harthi/",
    "surahTotal": 114
  },
  {
    "id": 67,
    "nameArabic": "عبدالمحسن القاسم",
    "name": "Abdulmohsen Al-Qasim",
    "server": "https://server8.mp3quran.net/qasm/",
    "surahTotal": 114
  },
  {
    "id": 68,
    "nameArabic": "عبدالمحسن العسكر",
    "name": "Abdulmohsin Al-Askar",
    "server": "https://server6.mp3quran.net/askr/",
    "surahTotal": 4,
    "surahList": "1,2,7,55"
  },
  {
    "id": 69,
    "nameArabic": "عبدالمحسن العبيكان",
    "name": "Abdulmohsin Al-Obaikan",
    "server": "https://server12.mp3quran.net/obk/",
    "surahTotal": 114
  },
  {
    "id": 7,
    "nameArabic": "أحمد سعود",
    "name": "Ahmad Saud",
    "server": "https://server11.mp3quran.net/saud/",
    "surahTotal": 30,
    "surahList": "85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 70,
    "nameArabic": "عبدالهادي أحمد كناكري",
    "name": "Abdulhadi Kanakeri",
    "server": "https://server6.mp3quran.net/kanakeri/",
    "surahTotal": 114
  },
  {
    "id": 71,
    "nameArabic": "عبدالودود حنيف",
    "name": "Abdulwadood Haneef",
    "server": "https://server8.mp3quran.net/wdod/",
    "surahTotal": 114
  },
  {
    "id": 72,
    "nameArabic": "عبدالولي الأركاني",
    "name": "Abdulwali Al-Arkani",
    "server": "https://server6.mp3quran.net/arkani/",
    "surahTotal": 114
  },
  {
    "id": 73,
    "nameArabic": "علي أبو هاشم",
    "name": "Ali Abo-Hashim",
    "server": "https://server9.mp3quran.net/abo_hashim/",
    "surahTotal": 14,
    "surahList": "11,12,18,19,21,25,50,51,52,53,54,55,56,57"
  },
  {
    "id": 74,
    "nameArabic": "علي بن عبدالرحمن الحذيفي",
    "name": "Ali Alhuthaifi",
    "server": "https://server9.mp3quran.net/hthfi/Rewayat-Sho-bah-A-n-Asim/",
    "surahTotal": 114
  },
  {
    "id": 76,
    "nameArabic": "علي جابر",
    "name": "Ali Jaber",
    "server": "https://server11.mp3quran.net/a_jbr/",
    "surahTotal": 114
  },
  {
    "id": 77,
    "nameArabic": "علي حجاج السويسي",
    "name": "Ali Hajjaj Alsouasi",
    "server": "https://server9.mp3quran.net/hajjaj/",
    "surahTotal": 114
  },
  {
    "id": 78,
    "nameArabic": "عماد زهير حافظ",
    "name": "Emad Hafez",
    "server": "https://server6.mp3quran.net/hafz/",
    "surahTotal": 114
  },
  {
    "id": 79,
    "nameArabic": "عبدالعزيز التركي",
    "name": "Abdulaziz Alturki",
    "server": "https://server16.mp3quran.net/a_turki/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  },
  {
    "id": 8,
    "nameArabic": "أحمد صابر",
    "name": "Ahmad Saber",
    "server": "https://server8.mp3quran.net/saber/",
    "surahTotal": 114
  },
  {
    "id": 80,
    "nameArabic": "عمر القزابري",
    "name": "Omar Al-Qazabri",
    "server": "https://server9.mp3quran.net/omar_warsh/",
    "surahTotal": 114
  },
  {
    "id": 81,
    "nameArabic": "فارس عباد",
    "name": "Fares Abbad",
    "server": "https://server8.mp3quran.net/frs_a/",
    "surahTotal": 114
  },
  {
    "id": 82,
    "nameArabic": "فهد العتيبي",
    "name": "Fahad Al-Otaibi",
    "server": "https://server8.mp3quran.net/fahad_otibi/",
    "surahTotal": 8,
    "surahList": "50,56,69,72,73,74,75,76"
  },
  {
    "id": 83,
    "nameArabic": "فهد الكندري",
    "name": "Fahad Al-Kandari",
    "server": "https://server11.mp3quran.net/kndri/",
    "surahTotal": 77,
    "surahList": "1,2,6,12,14,17,18,19,22,23,30,31,36,42,51,52,53,54,55,56,57,58,59,60,61,62,63,64,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 84,
    "nameArabic": "فواز الكعبي",
    "name": "Fawaz Alkabi",
    "server": "https://server8.mp3quran.net/fawaz/",
    "surahTotal": 49,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,21,22,23,25,26,27,28,29,30,33,35,36,39,40,41,49,54,55,56,57,58,59,62,63,66,67,73,78,87,109,112"
  },
  {
    "id": 85,
    "nameArabic": "لافي العوني",
    "name": "Lafi Al-Oni",
    "server": "https://server6.mp3quran.net/lafi/",
    "surahTotal": 84,
    "surahList": "3,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,27,28,29,30,31,32,33,35,36,37,38,39,40,41,42,43,44,45,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 86,
    "nameArabic": "ناصر القطامي",
    "name": "Nasser Alqatami",
    "server": "https://server6.mp3quran.net/qtm/",
    "surahTotal": 114
  },
  {
    "id": 87,
    "nameArabic": "نبيل الرفاعي",
    "name": "Nabil Al Rifay",
    "server": "https://server9.mp3quran.net/nabil/",
    "surahTotal": 114
  },
  {
    "id": 88,
    "nameArabic": "نعمة الحسان",
    "name": "Neamah Al-Hassan",
    "server": "https://server8.mp3quran.net/namh/",
    "surahTotal": 114
  },
  {
    "id": 89,
    "nameArabic": "هاني الرفاعي",
    "name": "Hani Arrifai",
    "server": "https://server8.mp3quran.net/hani/",
    "surahTotal": 114
  },
  {
    "id": 9,
    "nameArabic": "أحمد نعينع",
    "name": "Ahmad Nauina",
    "server": "https://server11.mp3quran.net/ahmad_nu/",
    "surahTotal": 114
  },
  {
    "id": 90,
    "nameArabic": "وليد الدليمي",
    "name": "Walid Al-Dulaimi",
    "server": "https://server8.mp3quran.net/dlami/",
    "surahTotal": 58,
    "surahList": "1,8,11,12,17,19,31,37,39,41,45,48,49,50,51,52,53,54,63,70,75,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114"
  },
  {
    "id": 91,
    "nameArabic": "وليد النائحي",
    "name": "Waleed Alnaehi",
    "server": "https://server9.mp3quran.net/waleed/",
    "surahTotal": 114
  },
  {
    "id": 92,
    "nameArabic": "ياسر الدوسري",
    "name": "Yasser Al-Dosari",
    "server": "https://server11.mp3quran.net/yasser/",
    "surahTotal": 114
  },
  {
    "id": 93,
    "nameArabic": "ياسر القرشي",
    "name": "Yasser Al-Qurashi",
    "server": "https://server9.mp3quran.net/qurashi/",
    "surahTotal": 114
  },
  {
    "id": 94,
    "nameArabic": "ياسر الفيلكاوي",
    "name": "Yasser Al-Faylakawi",
    "server": "https://server6.mp3quran.net/fyl/",
    "surahTotal": 88,
    "surahList": "1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,39,40,41,44,56,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,113,114"
  },
  {
    "id": 95,
    "nameArabic": "ياسر المزروعي ",
    "name": "Yasser Al-Mazroyee",
    "server": "https://server9.mp3quran.net/mzroyee/",
    "surahTotal": 114
  },
  {
    "id": 96,
    "nameArabic": "يحيى حوا",
    "name": "Yahya Hawwa",
    "server": "https://server12.mp3quran.net/yahya/",
    "surahTotal": 114
  },
  {
    "id": 97,
    "nameArabic": "يوسف الشويعي",
    "name": "Yousef Alshoaey",
    "server": "https://server9.mp3quran.net/yousef/",
    "surahTotal": 114
  },
  {
    "id": 98,
    "nameArabic": "عبدالله عبدل",
    "name": "Abdullah Abdal",
    "server": "https://server16.mp3quran.net/a_abdl/Rewayat-Hafs-A-n-Assem/",
    "surahTotal": 114
  }
];
