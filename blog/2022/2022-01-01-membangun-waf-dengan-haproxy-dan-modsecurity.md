---
layout: post
title: "Membangun Benteng Pertahanan: WAF dengan ModSecurity, HAProxy, dan OWASP CRS"
---

Halo semua! Keamanan aplikasi adalah harga mati, terutama kalau aplikasi kita sudah *go public*. Salah satu cara terbaik untuk melindunginya adalah dengan memasang **WAF (Web Application Firewall)**.

Hari ini kita akan bahas kombinasi maut: **HAProxy**, **ModSecurity (SPOA)**, dan **OWASP Core Rule Set (CRS)**.

### Konsep Dasar
Kenapa kombinasi ini? HAProxy sangat kencang sebagai load balancer, tapi dia tidak didesain untuk memeriksa isi paket HTTP secara mendalam (seperti mendeteksi SQL Injection). Di sinilah ModSecurity berperan sebagai "polisi" yang memeriksa setiap request.

Karena ModSecurity biasanya berbentuk modul (seperti di Nginx/Apache), untuk HAProxy kita menggunakan bantuan **SPOA (Stream Processing Offload Agent)**. Jadi HAProxy mengirimkan data request ke agen ModSecurity terpisah, diperiksa, lalu agen memberi tahu HAProxy apakah request itu boleh lewat atau harus diblokir.

### Komponen Utama
1.  **HAProxy**: Sebagai pintu gerbang utama.
2.  **ModSecurity SPOA**: Agen yang menjalankan engine ModSecurity.
3.  **OWASP CRS**: Kumpulan aturan (rules) sakti yang sudah diprogram untuk menangkal serangan umum seperti XSS, SQLi, dan Local File Inclusion.

### Cara Implementasi Singkat

#### 1. Persiapkan ModSecurity SPOA
Gunakan image dari `jcmoraisjr/modsecurity-spoa`. Di sini engine ModSecurity akan menunggu kiriman data dari HAProxy melalui protokol SPOP.

#### 2. Pasang OWASP CRS
Pastikan file rules dari `coreruleset/coreruleset` dimuat ke dalam konfigurasi ModSecurity Anda. Aturan-aturan inilah yang akan mendeteksi pola serangan.

#### 3. Konfigurasi HAProxy
Tambahkan blok `filter spoe` di bagian frontend HAProxy:

```haproxy
frontend https-in
    bind *:443 ssl crt /etc/ssl/certs/site.pem
    filter spoe engine modsecurity config /etc/haproxy/modsec.conf
    http-request deny if { var(txn.modsec.code) -m int gt 0 }
    default_backend web-servers
```

#### 4. Hubungkan via SPOE Config
Buat file `modsec.conf` untuk memberi tahu HAProxy ke mana harus mengirim data:

```haproxy
[modsecurity]
spoe-agent modsecurity-agent
    messages check-request
    option var-prefix modsec
    timeout hello      100ms
    timeout idle       30s
    timeout processing 500ms
    use-backend modsec-cluster

spoe-message check-request
    args method path query version headers payload
```

### Kenapa Ini Keren?
Dengan memisahkan proses pemeriksaan (offloading) ke agen terpisah, load balancer HAProxy Anda tetap bisa fokus melayani traffic dengan kencang, sementara keamanan tetap terjaga ketat oleh ModSecurity.

Jadi, jangan biarkan aplikasi Anda "telanjang" di internet ya! Pasang WAF sekarang juga. 🛡️💻

*Stay Secure, Folks!*
