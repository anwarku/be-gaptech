import mongoose from 'mongoose'
import moment from 'moment-timezone'
const { Schema } = mongoose

const outProductSchema = new Schema(
    {
        kodeProduk: { type: Number, unique: false, required: true },
        namaProduk: { type: String, required: true },
        stokKeluar: { type: Number, required: true },
        dateOutProduct: { type: Date, default: moment().tz('Asia/Jakarta').format() },
    },
    { versionKey: false }
)

const OutProducts = mongoose.model('OutProduct', outProductSchema)

export default OutProducts