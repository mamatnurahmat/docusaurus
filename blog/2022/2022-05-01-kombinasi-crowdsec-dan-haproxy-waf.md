---
layout: post
title: "Double Protection: Kombinasi Maut CrowdSec dan HAProxy WAF (ModSecurity)"
---

Halo teman-teman! Setelah sebelumnya kita membahas cara membangun WAF dengan HAProxy dan ModSecurity, sekarang saatnya kita menaikkan level keamanan kita ke tingkat yang lebih tinggi (dan lebih pintar!).

Pernah terpikir nggak, gimana kalau kita bisa memblokir serangan bahkan sebelum si penyerang mencoba mengetuk pintu aplikasi kita? Nah, itulah gunanya **CrowdSec**!

### Kenapa Kita Butuh CrowdSec?
Jika ModSecurity adalah "satpam" yang memeriksa setiap barang bawaan tamu (Deep Packet Inspection), maka CrowdSec adalah "intelijen keamanan" yang tahu daftar pelaku kejahatan dari seluruh dunia.

CrowdSec bekerja dengan cara menganalisis log dan mendeteksi perilaku mencurigakan (seperti brute force, port scanning, atau serangan DDoS). Kerennya lagi, jika satu pengguna CrowdSec mendeteksi serangan dari IP tertentu, IP tersebut akan dibagikan ke seluruh komunitas CrowdSec lainnya. *Community-powered security!*

### Arsitektur Pertahanan Berlapis (Layered Security)
Dengan menggabungkan keduanya di HAProxy, kita punya alur pertahanan seperti ini:
1.  **Layer 1 (CrowdSec):** Memeriksa apakah IP pengirim ada dalam daftar hitam (blocklist) atau menunjukkan perilaku mencurigakan berdasarkan log. Jika ya, langsung blokir!
2.  **Layer 2 (ModSecurity WAF):** Jika IP tersebut "bersih" di mata CrowdSec, maka isi permintaannya (payload) akan diperiksa oleh ModSecurity untuk memastikan tidak ada SQL Injection, XSS, dsb.

### Cara Kerjanya di HAProxy

Untuk mengintegrasikannya, kita biasanya menggunakan **CrowdSec LAPI** dan sebuah bouncer khusus untuk HAProxy.

#### 1. Pasang CrowdSec Agen
CrowdSec akan membaca log HAProxy (`/var/log/haproxy.log`) dan mendeteksi anomali.

#### 2. Gunakan HAProxy Bouncer
Bouncer ini bekerja di level HAProxy untuk menarik daftar IP yang harus diblokir dari CrowdSec lokal.

Di konfigurasi HAProxy, kita bisa menambahkan ACL untuk mengecek apakah IP pengunjung harus di-*drop*:

```haproxy
frontend https-in
    # Cek daftar blacklist dari CrowdSec (via stick-table atau ACL file)
    acl is_blacklisted src -f /etc/haproxy/crowdsec_blacklist.lst
    http-request deny if is_blacklisted

    # Jika lolos, kirim ke ModSecurity SPOA
    filter spoe engine modsecurity config /etc/haproxy/modsec.conf
    http-request deny if { var(txn.modsec.code) -m int gt 0 }
    
    default_backend web-servers
```

### Keuntungan Utama
*   **Hemat Resource:** Serangan dari IP jahat yang sudah terbit di list CrowdSec akan langsung diblokir tanpa perlu diproses oleh ModSecurity SPOA yang lebih berat.
*   **Update Real-time:** Database IP jahat terus diperbarui oleh ribuan pengguna CrowdSec lainnya secara otomatis.
*   **Visibilitas:** Kamu bisa melihat siapa saja yang mencoba menyerangmu melalui dashboard `cscli` yang sangat user-friendly.

### Kesimpulan
Menggabungkan **ModSecurity** (untuk inspeksi konten) dan **CrowdSec** (untuk reputasi IP) di atas **HAProxy** adalah strategi "Defense in Depth" yang sangat solid. Servermu jadi lebih aman, beban kerja CPU lebih efisien, dan kamu pun bisa tidur lebih tenang.

Gimana? Tertarik mencoba ramuan keamanan ini? 🛡️🚀

*Stay safe and keep hacking (the good way)!*
