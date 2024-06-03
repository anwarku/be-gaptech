import { mongoose } from 'mongoose'

const uri = 'mongodb+srv://12210952:LxUAJMyLgwk42asF@db-gaptech.m5swohz.mongodb.net/?retryWrites=true&w=majority&appName=db-gaptech'
export default mongoose.connect(uri)