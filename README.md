# Periodic Table & Chemical Workbench

Aplikasi web interaktif untuk eksplorasi 118 unsur kimia IUPAC, spektroskopi emisi optik atom terverifikasi NIST, simulator termodinamika wujud zat, laboratorium stoikiometri senyawa, serta komparator multi-parameter berbasis Vanilla JavaScript ES Modules.

Aplikasi ini dibangun tanpa ketergantungan framework eksternal, tanpa proses kompilasi atau bundler tambahan, dan sepenuhnya siap dioperasikan sebagai situs statis berkecepatan tinggi melalui GitHub Pages.

## Gambaran Umum

Periodic Table & Chemical Workbench dirancang sebagai media laboratorium virtual dan referensi sains yang akurat. Seluruh data unsur, bilangan oksidasi, konfigurasi elektron, titik leleh, titik didih, dan spektrum emisi atom disusun berdasarkan standar IUPAC serta database NIST (National Institute of Standards and Technology).

Aplikasi bekerja secara mandiri di sisi peramban (client-side) dengan dukungan Service Worker untuk pengoperasian luar jaringan (offline mode) dan Progressive Web App (PWA).

## Fitur Utama

### 1. Tabel Periodik 118 Unsur IUPAC
Tampilan tabel 18 kolom adaptif yang memuat seluruh 118 unsur kimia, termasuk deret Lantanida dan Aktinida. Setiap kartu unsur menyajikan informasi nomor atom, simbol, nama unsur, massa atom relatif, dan indikator wujud zat. Pengguna dapat memilih unsur untuk menampilkan panel inspektur di bagian tengah maupun membuka jendela dialog rincian menyeluruh.

### 2. Spektroskopi Emisi Atom NIST
Visualisasi spektrum emisi optik atom pada rentang panjang gelombang 380 nm hingga 750 nm. Data panjang gelombang garis spektrum diambil langsung dari NIST Atomic Spectra Database untuk menghasilkan garis emisi yang akurat secara ilmiah, menggantikan rumus matematis acak.

### 3. Diagram Orbital Valensi Aufbau dan Pauli
Visualisasi konfigurasi elektron kulit terluar menggunakan diagram kotak orbital dengan panah spin elektron (Aufbau dan larangan Pauli). Pengguna dapat melihat langsung persebaran elektron valensi untuk setiap unsur yang dipilih.

### 4. Simulator Suhu Termodinamika
Kontrol geser suhu dari rentang 0 K hingga 6000 K (setara minus 273 derajat Celsius hingga 5727 derajat Celsius). Sistem menghitung fasa zat (padat, cair, atau gas) untuk seluruh 118 unsur secara simultan pada suhu yang ditentukan secara real-time.

### 5. Mode Heatmap Visual
Pewarnaan tabel periodik dapat dialihkan ke beberapa mode analisis:
1. Mode Kategori Kimia: Pengelompokan unsur berdasarkan sifat logam alkali, alkali tanah, transisi, pasca transisi, metaloid, nonlogam reaktif, gas mulia, lantanida, dan aktinida.
2. Mode Fase Termodinamika: Visualisasi status wujud fisik zat pada suhu saat ini.
3. Heatmap Elektronegativitas: Gradasi warna berdasarkan skala Pauling.
4. Heatmap Massa Atom: Gradasi warna berdasarkan bobot massa molar.
5. Heatmap Titik Leleh: Gradasi intensitas warna berdasarkan temperatur leleh unsur.

### 6. Laboratorium Sintesis Stoikiometri dan Fusi Nuklir
Fasilitas eksperimen reaksi yang menyediakan dua mode kerja:
1. Reaksi Kimia dan Stoikiometri: Memadukan dua unsur dari slot reaktan untuk menghitung pembentukan rumus empiris senyawa, jenis ikatan (ionik atau kovalen berdasarkan selisih elektronegativitas), massa molar, rasio persentase massa, serta geometri kristal senyawa.
2. Transmutasi Fusi Inti: Mensimulasikan penggabungan dua inti atom (Z1 ditambah Z2) untuk menghasilkan unsur hasil sintesis nuklir dengan verifikasi batas kestabilan inti atom. Riwayat sintesis tersimpan secara lokal di peramban.

### 7. Komparator Parameter Unsur
Modul perbandingan berdampingan antara dua unsur kimia yang dipilih. Data perbandingan disajikan dalam tabel parameter fisik serta grafik radar SVG terstandarisasi untuk mengevaluasi perbedaan jari-jari atom, elektronegativitas, energi ionisasi, massa atom, dan titik leleh secara visual.

### 8. Sinkronisasi State URL
Setiap interaksi pemilihan unsur, pengaturan suhu, mode warna, serta pengisian reaktan laboratorium disinkronkan secara langsung ke parameter URL peramban. Tautan dapat disalin dan dibagikan kepada pengguna lain untuk membuka konfigurasi eksperimen yang sama persis.

### 9. Pencarian Cepat Command Palette
Dukungan pencarian instan berbasis nama, simbol kimia, maupun nomor atom dengan menekan kombinasi tombol Ctrl + K atau mengetik langsung pada kolom pencarian utama.

### 10. Mode Tampilan Gelap dan Terang
Dukungan tema ganda (Dark Mode dan Light Mode) yang dapat dialihkan secara instan melalui tombol pada bilah navigasi utama. Sistem mendeteksi preferensi tema bawaan sistem operasi peramban dan menyimpan pilihan tema pengguna ke dalam penyimpanan lokal (localStorage) agar tetap konsisten saat halaman dimuat ulang. Seluruh visualisasi kanvas atom Bohr, simulasi reaktor sintesis, serta grafik radar komparator secara dinamis menyesuaikan kontras warna terhadap tema aktif.

## Struktur Direktori

Berikut adalah susunan berkas dan direktori proyek:

index.html: Berkas halaman utama dan struktur antarmuka workbench.

manifest.json: Konfigurasi Progressive Web App untuk pemasangan aplikasi di perangkat.

sw.js: Service worker untuk caching berkas statis dan pengoperasian offline.

assets/: Direktori berkas statis gambar, QR code, dan ikon SVG.

styles/tokens.css: Variabel warna tema gelap dan terang, tipografi, serta scrollbar.

styles/layout.css: Tata letak grid tabel periodik, bilah kontrol, dan drawer kerja.

styles/components.css: Gaya visual kartu unsur, tombol kontrol, kanvas spektrum, dan modal dialog.

src/main.js: Titik masuk utama logika aplikasi, inisialisasi tema, modul, dan pengikatan event listener.

src/state/store.js: Pengelolaan state reaktif aplikasi terpusat.

src/data/elements.js: Basis data lengkap 118 unsur kimia IUPAC beserta sifat fisika dan kimianya.

src/data/compounds.js: Basis data senyawa kimia dan aturan stoikiometri empiris.

src/data/spectra.js: Basis data garis spektrum emisi atom NIST.

src/modules/periodic-grid.js: Logika pembuatan elemen DOM tabel periodik dan navigasi sel.

src/modules/quantum-canvas.js: Rendering grafik spektrum NIST pada kanvas HTML5 dan animasi model atom Bohr.

src/modules/synthesis-lab.js: Mesin komputasi stoikiometri, reaksi kimia, dan kalkulasi fusi inti.

src/modules/comparator.js: Mesin pembanding unsur dan kalkulasi koordinat radar SVG.

src/modules/thermodynamics.js: Logika perhitungan perubahan wujud fasa zat berdasarkan nilai suhu.

src/utils/dom.js: Pembantu manipulasi DOM dan konfigurasi kanvas resolusi tinggi (HiDPI).

src/utils/url-state.js: Pembaca dan penyimpan parameter URL untuk pelestarian status eksperimen.

.github/workflows/deploy.yml: Konfigurasi GitHub Actions untuk deployment otomatis ke GitHub Pages.

## Cara Menjalankan di Lingkungan Lokal

Karena aplikasi ini menggunakan modul standar ES Modules (import dan export JavaScript native), peramban membatasi pemuatan berkas melalui protokol file:// demi alasan keamanan CORS. Aplikasi perlu dijalankan melalui server web lokal.

### Menggunakan Node.js (npx)
Buka terminal pada direktori proyek dan jalankan perintah:
npx serve .

Atau menggunakan modul alternatif:
npx http-server .

Buka alamat localhost yang tercantum pada terminal (contoh: http://localhost:3000) pada peramban Anda.

### Menggunakan Python
Jika lingkungan Anda memiliki instalasi Python 3, jalankan perintah:
python -m http.server 8000

Buka peramban dan navigasikan ke alamat http://localhost:8000.

### Menggunakan Editor Teks
Jika menggunakan VS Code atau editor sejenis, pasang ekstensi Live Server, lalu klik kanan pada berkas index.html dan pilih menu Open with Live Server.

## Prosedur Deployment GitHub Pages

Proyek ini telah dilengkapi alur kerja otomatis GitHub Actions. Langkah mempublikasikannya adalah:

1. Buat repositori baru pada akun GitHub Anda.
2. Unggah atau dorong (push) seluruh berkas proyek ke branch main atau master.
3. Buka menu Settings pada repositori GitHub tersebut.
4. Pilih menu Pages pada bilah navigasi sebelah kiri.
5. Pada bagian Build and deployment, ubah pilihan Source menjadi GitHub Actions.
6. Alur kerja .github/workflows/deploy.yml akan otomatis berjalan dan situs Anda akan aktif beberapa saat kemudian pada domain github.io.

## Sumber Data Ilmiah

1. International Union of Pure and Applied Chemistry (IUPAC): Standar penamaan, simbol, nomor atom, dan bobot massa atom standar.
2. National Institute of Standards and Technology (NIST) Physical Measurement Laboratory: Atomic Spectra Database Lines Data untuk panjang gelombang spektrum optik emisi atom terverifikasi.

## Kreator dan Dukungan

Proyek ini dikembangkan oleh @nocturnalist sebagai perangkat lunak sumber terbuka (open-source) untuk mendukung pembelajaran sains yang mudah diakses dan bebas biaya.

Dukungan pengembangan dapat disalurkan melalui platform Saweria pada tautan:
https://saweria.co/nocturnalist
