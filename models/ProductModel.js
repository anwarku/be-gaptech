import mongoose from "mongoose";
import moment from "moment-timezone";
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    kodeProduk: {
      type: Number,
      unique: true,
      required: true,
      minlength: 13,
      maxlength: 13,
    },
    namaProduk: { type: String, required: true, unique: true },
    harga: { type: Number, required: true },
    stok: { type: Number, required: true },
    posisiRak: { type: String, required: true },
    createdAt: { type: Date, default: moment().tz("Asia/Jakarta").format() },
    updatedAt: { type: Date, default: moment().tz("Asia/Jakarta").format() },
  },
  { versionKey: false }
);

const Products = mongoose.model("Product", productSchema);

export default Products;
