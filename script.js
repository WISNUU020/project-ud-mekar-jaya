document.addEventListener("DOMContentLoaded", () => {
  // 1. HAMBURGER MENU LGOIC
  const menuToggle = document.getElementById("mobile-menu");
  const navMenu = document.querySelector("nav ul");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // 2. LOGIKA FORM PEMESANAN
  const catChecks = document.querySelectorAll(".cat-check");

  // Tampilkan/Sembunyikan detail kategori saat diceklis
  catChecks.forEach((check) => {
    check.addEventListener("change", function () {
      const targetBody = document.getElementById(this.dataset.target);
      if (this.checked) {
        targetBody.classList.remove("hidden");
      } else {
        targetBody.classList.add("hidden");
        // Reset nilai di dalam jika uncheck
        targetBody.querySelector(".prod-qty").value = 1;
      }
      calculateTotal();
    });
  });

  // Hitung ulang setiap kali input berubah
  document.querySelectorAll(".prod-qty, .prod-type").forEach((el) => {
    el.addEventListener("input", calculateTotal);
  });
  document.querySelectorAll(".prod-type").forEach((el) => {
    el.addEventListener("change", calculateTotal);
  });
});

// Fungsi Menghitung Total Harga & Ringkasan
function calculateTotal() {
  let grandTotal = 0;
  let itemCount = 0;
  let summaryHTML = "";

  document.querySelectorAll(".cat-check:checked").forEach((check) => {
    const targetId = check.dataset.target;
    const body = document.getElementById(targetId);
    const catName = check.value;

    // Ambil harga dari dropdown jika ada, jika tidak cek data-price default
    let price = 0;
    let subName = catName;
    const selectEl = body.querySelector(".prod-type");

    if (selectEl) {
      price =
        parseInt(selectEl.options[selectEl.selectedIndex].dataset.price) || 0;
      subName = selectEl.value; // ex: Freestanding
    } else {
      price = parseInt(body.querySelector(".prod-qty").dataset.price) || 0;
    }

    const qty = parseInt(body.querySelector(".prod-qty").value) || 1;
    const subtotal = price * qty;

    grandTotal += subtotal;
    itemCount += qty;

    summaryHTML += `
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem;">
        <span>${subName} (x${qty})</span>
        <strong>${price === 0 ? "Nego Admin" : "Rp " + subtotal.toLocaleString("id-ID")}</strong>
      </div>
    `;
  });

  const summaryDiv = document.getElementById("summary-items");
  const totalDiv = document.getElementById("grand-total");
  const qtyDiv = document.getElementById("summary-qty");

  if (summaryDiv) {
    summaryDiv.innerHTML =
      summaryHTML ||
      "<p style='color:#94a3b8; font-size:0.9rem;'>Belum ada produk yang dipilih.</p>";
    qtyDiv.innerText = `Total Produk: ${itemCount} Item`;
    totalDiv.innerText =
      grandTotal === 0
        ? "Menunggu Kalkulasi"
        : `Rp ${grandTotal.toLocaleString("id-ID")}`;
  }
}

// 3. FUNGSI KIRIM KE WHATSAPP
function sendToWhatsApp() {
  // Ambil Data Pembeli
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const email = document.getElementById("cust-email").value.trim();
  const address = document.getElementById("cust-address").value.trim();
  const payment = document.querySelector('input[name="payment"]:checked').value;

  if (!name || !phone || !email || !address) {
    alert(
      "❌ Mohon lengkapi Data Pembeli (Nama, HP, Email, Alamat) terlebih dahulu.",
    );
    return;
  }

  const checkedCats = document.querySelectorAll(".cat-check:checked");
  if (checkedCats.length === 0) {
    alert("❌ Mohon pilih minimal 1 kategori produk.");
    return;
  }

  let itemsText = "";
  let totalBelanja = 0;
  let isCustom = false;

  checkedCats.forEach((check) => {
    const targetId = check.dataset.target;
    const body = document.getElementById(targetId);
    const catName = check.value;

    let price = 0;
    let subName = catName;
    const selectEl = body.querySelector(".prod-type");

    if (selectEl) {
      price =
        parseInt(selectEl.options[selectEl.selectedIndex].dataset.price) || 0;
      subName = selectEl.value;
    } else {
      price = parseInt(body.querySelector(".prod-qty").dataset.price) || 0;
    }

    if (price === 0) isCustom = true;

    // Ambil Dimensi & Data lain
    const p = body.querySelector(".dim-p")
      ? body.querySelector(".dim-p").value || "0"
      : "-";
    const l = body.querySelector(".dim-l")
      ? body.querySelector(".dim-l").value || "0"
      : "-";
    const t = body.querySelector(".dim-t")
      ? body.querySelector(".dim-t").value || "0"
      : "-";
    const qty = parseInt(body.querySelector(".prod-qty").value) || 1;
    const note = body.querySelector(".prod-note").value.trim() || "-";

    const subtotal = price * qty;
    totalBelanja += subtotal;

    itemsText += `📦 *${subName}*\n`;
    itemsText += `   Dimensi (PxLxT) : ${p} x ${l} x ${t} mm\n`;
    itemsText += `   Jumlah Pesanan  : ${qty} Unit\n`;
    itemsText += `   Catatan Khusus  : ${note}\n`;
    itemsText += `   Subtotal        : ${price === 0 ? "Harga Kesepakatan" : "Rp " + subtotal.toLocaleString("id-ID")}\n\n`;
  });

  const finalTotal = isCustom
    ? "Menunggu Kesepakatan (Nego)"
    : `*Rp ${totalBelanja.toLocaleString("id-ID")}*`;

  // Format Struk WhatsApp
  const waNumber = "6285234599950";
  const message = `
==============================
🧾 *STRUK PEMESANAN UD MEKAR JAYA*
==============================

👤 *DATA PEMBELI*
Nama   : ${name}
No. HP : ${phone}
Email  : ${email}
Alamat : ${address}

🛒 *DETAIL PESANAN*
${itemsText}
💳 *PEMBAYARAN*
Metode : ${payment}
*TOTAL TAGIHAN : ${finalTotal}*

==============================
_Mohon periksa kembali detail pesanan Anda. Admin kami akan segera merespon pesan ini untuk konfirmasi._
  `.trim();

  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}
