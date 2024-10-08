import Products from "../models/ProductModel.js";
import InProducts from "../models/InProductModel.js";
import Racks from "../models/RackModel.js";
import Transaction from "../models/TransactionModel.js";
import moment from "moment-timezone";

function generateRandomNumber(length) {
    let randomNumber = '';
    for (let i = 0; i < length; i++) {
        randomNumber += Math.floor(Math.random() * 10);
    }
    return randomNumber;
}

export const getProducts = async (req, res) => {
    try {
        const products = await Products.find({}, { _id: 0 }).sort({ namaProduk: 1 })
        res.json(products)
    } catch (error) {
        res.sendStatus(500).json({ msg: "Ada kesalahan pada server" })
    }
}

export const getProduct = async (req, res) => {
    const kodeProduk = req.params.kodeProduk
    try {
        const product = await Products.findOne({ kodeProduk }, { _id: 0 })
        if (!product) return res.status(404).json({ msg: 'Produk tidak ditemukan' })
        res.json(product)
    } catch (error) {
        res.sendStatus(500).json({ msg: "Ada kesalahan pada server" })
    }
}

export const addProduct = async (req, res) => {
    try {
        // add field kodeProduk, createdAt and updatedAt
        req.body.kodeProduk = parseInt(generateRandomNumber(13))
        req.body.createdAt = moment().tz('Asia/Jakarta').format()
        req.body.updatedAt = moment().tz('Asia/Jakarta').format()

        // cek apakah nama produk sudah ada di database
        const cekNamaProduk = await Products.exists({ namaProduk: req.body.namaProduk })
        if (cekNamaProduk) return res.status(409).json({ msg: `Produk ${req.body.namaProduk} sudah tersedia!` })

        // cek apakah rak masih kosong ketika ditambahkan produk baru
        const cekRak = await Racks.findOne({ rak: req.body.posisiRak })
        if (!cekRak) {
            // ketika rak tidak ada dalam database
            return res.status(400).json({ msg: `Rak ${req.body.posisiRak} tidak terdaftar!` })
        } else {
            // ketika rak sudah terisi
            if (cekRak.terisi !== 0) return res.status(406).json({ msg: `Rak ${req.body.posisiRak} sudah terisi` })
        }

        // cek stok produk baru apakah melebihi kapasitas
        if (req.body.stok > cekRak.kapasitas) return res.status(406).json({ msg: "Stok produk melebihi kapasitas rak!" })

        // save new product to database
        await Products.create(req.body)

        // mengisi rak kosong dengan produk yang baru
        await Racks.updateOne(
            { rak: req.body.posisiRak.toUpperCase() },
            {
                produk: req.body.namaProduk,
                terisi: req.body.stok
            })

        // Mengecek jika stok bukan sama dengan nol
        if (parseInt(req.body.stok) !== 0) {
            // Menambahkan data produk masuk ke dalam collection inProducts
            await InProducts.create({
                kodeProduk: req.body.kodeProduk,
                namaProduk: req.body.namaProduk,
                stokMasuk: req.body.stok,
                dateInProduct: moment().tz('Asia/Jakarta').format()
            })
        }

        res.status(201).json({ msg: 'Produk berhasil ditambahkan!', kodeProduk: req.body.kodeProduk })
    } catch (error) {
        res.sendStatus(500).json({ msg: "Ada kesalahan pada server" })
    }
}

export const updateProduct = async (req, res) => {
    const kodeProduk = req.params.kodeProduk
    req.body.updatedAt = moment().tz('Asia/Jakarta').format()
    try {
        // cek apakah produk ada dalam database
        const cekProduk = await Products.findOne({ kodeProduk })
        if (!cekProduk) return res.status(404).json({ msg: 'Produk tidak ditemukan' })

        // cek nama produk apakah sama dengan produk lain
        const cekNamaProduk = await Products.exists({ namaProduk: req.body.namaProduk })
        if (cekNamaProduk) return res.status(409).json({ msg: `Nama produk ${req.body.namaProduk} sudah ada!` })

        // Mengecek jika posisi rak tidak dikirim dalam request
        if (req.body.posisiRak) {
            // validasi rak ketika produk di update
            const cekRak = await Racks.findOne({ rak: req.body.posisiRak })
            if (!cekRak) {
                // ketika rak tidak ada dalam database
                return res.status(400).json({ msg: `Rak ${req.body.posisiRak} tidak terdaftar!` })
            } else {
                // ketika rak sudah terisi
                if (cekRak.terisi !== 0) return res.status(406).json({ msg: `Rak ${req.body.posisiRak} sudah terisi` })
            }
        }

        // Mengupdate perubahan pada data produk
        await Products.updateOne({ kodeProduk }, req.body)

        // Mengupdate posisi rak ketika rak berubah
        if (cekProduk.posisiRak !== req.body.posisiRak) {
            // Mengubah data rak lama
            await Racks.updateOne(
                { rak: cekProduk.posisiRak },
                { terisi: 0, produk: null }
            )

            // Mengubah data rak baru
            await Racks.updateOne(
                { rak: req.body.posisiRak },
                { terisi: cekProduk.stok, produk: req.body.namaProduk ? req.body.namaProduk : cekProduk.namaProduk }
            )
        }

        res.json({ msg: `Kode produk ${kodeProduk} berhasil diperbaharui!` })
    } catch (error) {
        res.sendStatus(500).json({ msg: "Ada kesalahan pada server" })
    }
}

export const deleteProduct = async (req, res) => {
    const kodeProduk = req.params.kodeProduk
    try {
        const product = await Products.findOne({ kodeProduk })
        if (!product) return res.status(404).json({ msg: "Kode produk tidak ditemukan!" })

        // Mengecek produk jika ada transaksi yang belum selesai
        const transactionsProcess = await Transaction.find(
            { status: 0 }
        )

        for (const itemProcess of transactionsProcess) {
            const cekProduk = itemProcess.barangKeluar.find(produk => produk.kodeProduk == kodeProduk)
            if (cekProduk) return res.status(423).json({ msg: "Tidak bisa menghapus produk, masih ada transaksi yang belum selesai!" })
        }

        // Mengecek jika produk masih ada stoknya
        if (product.stok !== 0) return res.status(423).json({ msg: "Tidak bisa menghapus produk, masih ada stok!" })

        // jika kode produk ada di database
        await Products.deleteOne({ kodeProduk })

        // Mengosongkan data rak ketika produk di hapus
        await Racks.updateOne(
            { rak: product.posisiRak },
            { terisi: 0, produk: null }
        )
        res.sendStatus(204)
    } catch (error) {
        res.sendStatus(500).json({ msg: "Ada kesalahan pada server" })
    }
}

export const addStock = async (req, res) => {
    const kodeProduk = req.params.kodeProduk
    try {
        const product = await Products.findOne({ kodeProduk })
        const rack = await Racks.findOne({ rak: product.posisiRak })
        if (!product) return res.status(404).json({ msg: "Produk tidak ditemukan!" })

        // Mengecek jika stok produk melebihi kapasitas rak
        if (req.body.stokBaru + product.stok > rack.kapasitas) {
            return res.status(406).json({ msg: "Stok produk melebihi kapasitas rak!" })
        }

        // update total stock in products collection
        await Products.updateOne({ kodeProduk }, {
            stok: req.body.stokBaru + product.stok,
            updatedAt: moment().tz('Asia/Jakarta').format()
        })

        // update rak terisi
        await Racks.updateOne(
            { rak: product.posisiRak },
            { terisi: req.body.stokBaru + product.stok }
        )

        // add in product data to in product collection for history
        await InProducts.create({
            kodeProduk: kodeProduk,
            namaProduk: product.namaProduk,
            stokMasuk: req.body.stokBaru,
            dateInProduct: moment().tz('Asia/Jakarta').format()
        })

        res.json({ msg: `Berhasil menambah stok ${product.namaProduk}!` })
    } catch (error) {
        res.sendStatus(500).json({ msg: "Ada kesalahan pada server" })
    }
}

