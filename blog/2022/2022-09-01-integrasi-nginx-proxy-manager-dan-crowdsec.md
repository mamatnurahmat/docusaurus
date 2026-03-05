---
layout: post
title: "Nginx Proxy Manager Lebih Aman dengan CrowdSec: Bye-bye Hacker!"
---

Halo teman-teman pengabdi *self-hosting*! Buat kalian yang mengelola banyak layanan di rumah atau di VPS, pasti nggak asing lagi sama **Nginx Proxy Manager (NPM)**. Tinggal klik-klik di dashboard, SSL aktif, proxy beres. Tapi, apakah itu cukup aman?

Hari ini kita bakal bahas cara bikin Nginx Proxy Manager kalian jadi "kebal" serangan dengan bantuan **CrowdSec**.

### Apa itu Nginx Proxy Manager (NPM)?
Singkatnya, NPM adalah wajah ganteng dari Nginx. Dia memberikan kita antarmuka web (GUI) untuk mengatur *reverse proxy* tanpa perlu pusing ngedit file `.conf` secara manual. Sangat praktis, tapi secara default dia nggak punya sistem pertahanan aktif yang kuat terhadap serangan brute force atau bot jahat.

### Kenalin, CrowdSec sang Penjaga Malam
CrowdSec adalah sistem keamanan modern yang membaca log aplikasi kalian dan mendeteksi perilaku aneh. Kalau ada IP yang mencoba login berkali-kali ke dashboard kalian tapi gagal terus, CrowdSec bakal bilang: *"Eits, nggak bisa! Kamu saya blokir!"*.

Kehebatan CrowdSec adalah dia berbagi daftar penjahat ini ke seluruh penggunanya. Jadi kalau si penyerang sudah diblokir di server orang lain, dia bakal otomatis diblokir juga di server kalian sebelum sempat mencoba menyerang.

### Cara Integrasinya
Ada beberapa cara, tapi yang paling populer dan rapi adalah menggunakan **CrowdSec Bouncer** yang masuk ke dalam alur kerja Nginx Proxy Manager.

Secara teknis, NPM menggunakan **OpenResty** (Nginx + Lua). Kita bisa menyisipkan "Bouncer" berbasis Lua di dalam NPM:
1.  **Parsing Log:** CrowdSec akan membaca log akses dari NPM.
2.  **Keputusan (Decisions):** Jika CrowdSec menemukan IP jahat, dia akan menyimpannya di database lokal (LAPI).
3.  **Bouncer:** Setiap ada tamu yang datang ke NPM, si Bouncer bakal cek dulu ke CrowdSec: *"IP ini boleh lewat nggak?"*. Kalau CrowdSec bilang blokir, si tamu bakal langsung dikasih halaman "403 Forbidden" atau halaman Captcha.

### Kenapa Ini Penting?
*   **Melindungi Layanan di Belakangnya:** Bukan cuma NPM yang aman, tapi aplikasi yang kalian proxy-kan (seperti Home Assistant, Portainer, atau Blog ini) juga ikut terlindungi.
*   **Ringan:** Berbeda dengan WAF tradisional yang berat, CrowdSec sangat hemat resource.
*   **Otomatis:** Sekali setup, kalian tinggal duduk manis. CrowdSec akan terus mengupdate daftar IP jahat secara real-time.

### Kesimpulan
Nginx Proxy Manager bikin hidup kita mudah dalam urusan koneksi, dan CrowdSec bikin hidup kita tenang dalam urusan keamanan. Kombinasi ini adalah paket wajib buat kalian yang mau serius di dunia *self-hosting*.

Jadi, sudahkah kalian memasang satpam digital untuk NPM kalian hari ini? 🛡️🌐

*Happy hosting and stay secure!*
