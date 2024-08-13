import moment from 'moment-timezone'
import mongoose from 'mongoose'
const { Schema } = mongoose

const inProductSchema = new Schema(
    {
        kodeProduk: { type: Number, unique: false, required: true },
        namaProduk: { type: String, required: true },
        stokMasuk: { type: Number, required: true },
        dateInProduct: { type: Date, default: moment().tz('Asia/Jakarta').format() },
    },
    { versionKey: false }
)

const InProducts = mongoose.model('InProduct', inProductSchema)

export default InProducts