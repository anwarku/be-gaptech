import mongoose from 'mongoose'
import moment from 'moment-timezone'
const { Schema } = mongoose

// Catatan :
// Alasan menggunakan library moment-timezone
// Karena pada server hosting, timezone yang digunakan bukan timezone Indonesia
// Jadi saya mengkonversi timezone server ke timezone Indonesia

const transactionSchema = new Schema(
    {
        idTransaksi: { type: Number, unique: true, required: true },
        namaPemesan: { type: String, required: true },
        alamatPengiriman: { type: String, required: true },
        barangKeluar: { type: Array, required: true },
        totalHarga: { type: Number, required: true },
        status: { type: Number, required: true, default: 0 },
        tanggalTransaksi: { type: Date, default: moment().tz('Asia/Jakarta').format() },
        terakhirDiubah: { type: Date, default: moment().tz('Asia/Jakarta').format() },
    },
    { versionKey: false }
)

const Transaction = mongoose.model('Transaction', transactionSchema)

export default Transaction