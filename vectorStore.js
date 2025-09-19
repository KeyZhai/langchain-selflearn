import { TextLoader } from "langchain/document_loaders/fs/text"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { FaissStore } from "@langchain/community/vectorstores/faiss"
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi"

import dotenv from 'dotenv'
dotenv.config()

const run = async () =>{
    const loader = new TextLoader('./data/kong.txt')
    const docs = await loader.load()
    
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20
    })
    const splitDocs = await splitter.splitDocuments(docs)
    
    const embeddings = new AlibabaTongyiEmbeddings({
        apiKey: process.env.TONGYI_API_KEY,
        model: 'qwen-plus'
    })
    const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
    const directory = './db/kongyiji';
    await vectorStore.save(directory);
}
  
run()
