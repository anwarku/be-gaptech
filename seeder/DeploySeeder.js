import { faker } from "@faker-js/faker/locale/id_ID";
import Database from "../config/Database.js";
import Products from "../models/ProductModel.js";
import InProducts from "../models/InProductModel.js";
import OutProducts from "../models/OutProductModel.js";
import Transaction from "../models/TransactionModel.js";
import Racks from "../models/RackModel.js";
import mongoose from "mongoose";

async function transaksiMasuk() {
    // Menghapus semua collections kecuali collection user
    const colls = await mongoose.connection.listCollections()
    for (const coll of colls) {
        if (coll.name == 'users') continue
        await mongoose.connection.dropCollection(coll.name)
        // console.log(coll.name)
    }

    // Menambahkan data produk baru
    const dataProduk = [
        { nama: "PaperOne Kertas A3 75gr Copier (1 rim)", harga: 105000 },
        { nama: "PaperOne Kertas A3 80gr All Puporse (1 rim)", harga: 114600 },
        { nama: "PaperOne Kertas A3 85gr Digital (1 rim)", harga: 114600 },
        { nama: "PaperOne Kertas A3 100gr Digital (1 rim)", harga: 157200 },
        { nama: "PaperOne Kertas A4 75gr Copier (1 rim)", harga: 47000 },
        { nama: "PaperOne Kertas A4 85gr Digital (1 rim)", harga: 53100 },
        { nama: "PaperOne Kertas A4 80gr All Puporse (1 rim)", harga: 52150 },
        { nama: "PaperOne Kertas A4 100gr Digital (1 rim)", harga: 75300 },
        { nama: "PaperOne Kertas F4 75gr Copier (1 rim)", harga: 55400 },
        { nama: "PaperOne Kertas F4 80gr All Purpose (1 rim)", harga: 62000 },
        { nama: "PaperOne Kertas Q4 75gr Copier (1 rim)", harga: 49300 },
        { nama: "PaperOne Kertas Quarto 80gr All Purpose (1 rim)", harga: 51400 },
        { nama: "PP Lite Kertas A3 75gr Copier (1 rim)", harga: 96900 },
        { nama: "PP Lite Kertas A4 75gr Copier (1 rim)", harga: 48400 },
        { nama: "PP Lite Kertas F4 75gr Copier (1 rim)", harga: 55300 },
        { nama: "BolaDunia Quarto 80gr Copier (1 rim)", harga: 56510 },
        { nama: "BolaDunia A3 70gr Copier (1 rim)", harga: 117100 },
        { nama: "Kertas HVS F4 75gr Ekon Copy Paper (1 rim)", harga: 49600 },
        { nama: "Kertas HVS A4 70gr ZAP (1 rim)", harga: 45100 },
        { nama: "Kertas Concorde A4 90gr (1 rim)", harga: 174400 },
        { nama: "Kertas HVS Warna A5 70gr (1 rim)", harga: 41000 },
        { nama: "Kertas Folio F4 (1 rim)", harga: 30900 },
        { nama: "Kertas HVS 75gr A4 E-Paper (1 rim)", harga: 48500 },
        { nama: "Inkjet Photo Paper Blueprint A4 (1 rim)", harga: 23600 },
        { nama: "Kertas Raport K13 A4 80gr (1 rim)", harga: 100000 },
        { nama: "Kertas HVS F4 75gr Sinar Dunia (1 rim)", harga: 60000 },
        { nama: "Kertas HVS MBO A4 75gr (1 rim)", harga: 47500 },
        { nama: "Kertas HVS PP Lite A4 75gr (1 rim)", harga: 43000 },
        { nama: "Kertas HVS Natural A4 70gr (1 rim)", harga: 48000 },
        { nama: "Kertas HVS Maxi Brite A4 70gr (1 rim)", harga: 42500 },
        { nama: "Paperline Signature Kertas A4 80gr (1 rim)", harga: 6123 }
    ]

    let rakArray = [];
    for (let i = 1; i < 2; i++) {
        for (let j = 1; j <= 3; j++) {
            for (let k = 1; k <= 4; k++) {
                for (let l = 1; l <= 4; l++) {
                    rakArray.push(`L${i}-${j}-${k}-${l}`);
                    await Racks.create(
                        {
                            rak: `L${i}-${j}-${k}-${l}`,
                            kapasitas: 500,
                            terisi: 0
                        }
                    )
                }
            }
        }
    }

    // Perulangan untuk menambah produk baru ke products collection
    for (const item of dataProduk) {
        const newProduct = {
            kodeProduk: faker.string.numeric(13),
            namaProduk: item.nama,
            harga: item.harga,
            stok: 0,
            posisiRak: faker.helpers.arrayElement(rakArray),
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01")
        }

        // Menghapus rak yang sudah terisi
        rakArray = rakArray.filter((rak) => rak !== newProduct.posisiRak)

        // Menambahkan data ke products collection
        await Products.create(newProduct)

        // Mengubah field produk pada racks collection
        await Racks.updateOne(
            { rak: newProduct.posisiRak },
            {
                produk: newProduct.namaProduk,
                terisi: newProduct.stok
            }
        )
    }

    const allProducts = await Products.find()

    // Menambahkan data stok masuk
    for (let b = 0; b < 250; b++) {
        const randProduct = faker.helpers.arrayElement(allProducts)
        const stokBaru = faker.number.int({ min: 20, max: 50 })

        // Mengecek apakah suatu produk pada rak melebihi kapasitas
        const rakProduk = await Racks.findOne({ rak: randProduct.posisiRak })
        if (stokBaru > (rakProduk.kapasitas - rakProduk.terisi)) {
            console.log(`Stok ${randProduct.namaProduk} melebihi kapasitas kosong!`)
            continue
        }

        // Mengupdate stok masuk di products collection
        await Products.updateOne(
            { kodeProduk: randProduct.kodeProduk },
            {
                $inc: { stok: +stokBaru }
            }
        )

        // Menambahkan data ke inproducts collection
        await InProducts.create(
            {
                kodeProduk: randProduct.kodeProduk,
                namaProduk: randProduct.namaProduk,
                stokMasuk: stokBaru,
                dateInProduct: faker.date.between(
                    {
                        from: new Date("2024-01-01"),
                        to: new Date("2024-08-12")
                    }
                )
            }
        )

        // Mengupdate stok terisi pada racks collection
        await Racks.updateOne(
            { rak: randProduct.posisiRak },
            {
                $inc: { terisi: +stokBaru }
            }
        )
    }
}

async function transaksiKeluar() {

    for (let j = 0; j < 90; j++) {

        // Mendapatkan semua data products
        const allProducts = await Products.find()

        // Generate data barang keluar
        // Array untuk menampung data barang keluar
        const outProducts = []

        // Array untuk menyimpan subtotal dan menjumlahkan
        const totalHarga = []

        // Jumlah barang keluar
        const jumlahBarang = faker.number.int({ min: 3, max: 8 })

        // Looping untuk mendapatkan random data-data produk
        for (let k = 0; k < jumlahBarang; k++) {
            // Mengatur jumlah kuantitas barang keluar
            let kuantitas = faker.number.int({ min: 8, max: 20 })

            // Looping akan terus berjalan sampai random produk
            // tidak ada pada array outProducts dan
            // jumlah kuantitas tidak melebihi stok produk
            let outProduct;
            do {
                outProduct = faker.helpers.arrayElement(allProducts)
            } while (
                outProducts.find(
                    (item) => item.kodeProduk == outProduct.kodeProduk
                )
            );

            // Mengecek apakah kuantitas melebihi dari stok yang ada
            if (kuantitas > outProduct.stok) {
                console.log(`Kuantitas ${outProduct.namaProduk} melebihi stok!`)
                continue
            }

            // Mendefinisikan data barang keluar
            outProduct = {
                kodeProduk: outProduct.kodeProduk,
                namaProduk: outProduct.namaProduk,
                kuantitas,
                hargaSatuan: outProduct.harga,
                subTotal: outProduct.harga * kuantitas,
            };

            // Menambahkan element total harga dan barang keluar
            totalHarga.push(outProduct.subTotal)
            outProducts.push(outProduct)
        }



        // Mendefinisikan data untuk tiap transaksi
        const current = faker.date.between({ from: "2024-02-15", to: "2024-08-10" });
        const transaction = {
            idTransaksi: `${current.getFullYear()}${String(current.getMonth() + 1).padStart(2, "0")}${String(current.getDate()).padStart(2, "0")}${faker.string.numeric({ length: 4 })}`,

            namaPemesan: faker.person.fullName(),

            alamatPengiriman: `${faker.location.streetAddress()} ${faker.location.city()} ${faker.location.zipCode()}`,

            barangKeluar: outProducts,

            totalHarga: totalHarga.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
            ),

            status: faker.helpers.arrayElement([0, 1]),

            tanggalTransaksi: current

        }

        // Menyimpan data transaksi ke transactions collection
        await Transaction.create(transaction)

        for (const item of outProducts) {
            // Menambahkan history barang keluar ke outproducts collection
            if (transaction.status === 1) {
                await OutProducts.create(
                    {
                        kodeProduk: item.kodeProduk,
                        namaProduk: item.namaProduk,
                        stokKeluar: item.kuantitas,
                        dateOutProduct: transaction.tanggalTransaksi
                    }
                )
            }

            // Mengurangi stok produk pada products collection
            await Products.updateOne(
                { kodeProduk: item.kodeProduk },
                { $inc: { stok: -item.kuantitas } }
            )

            // Mengurangi terisi pada racks collection
            await Racks.updateOne(
                { produk: item.namaProduk },
                { $inc: { terisi: -item.kuantitas } }
            )
        }
    }
}

// Menjalankan seeder transaksi
transaksiMasuk()
    .then(() => console.log('Transaksi masuk seeder has been done!'))
    .then(() => transaksiKeluar())
    .then(() => console.log('Transaksi keluar seeder has been done!'))
    .then(() => mongoose.connection.close())

