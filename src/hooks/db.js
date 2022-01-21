import {collection, deleteDoc, doc, getDocs, getDoc, getFirestore, setDoc} from "firebase/firestore";

const getItems = async () => {
    return await getDocs(collection(getFirestore(), "items"));
}

const getItem = async (id) => {
    let item = await getDoc(doc(getFirestore(), "items", id));
    return item.data();
}

const saveItem = async (item) => {
    await setDoc(doc(getFirestore(), "items", item.id), item);
}

const deleteItem = async (id) => {
    await deleteDoc(doc(getFirestore(), "items", id));
}

export {getItems, getItem, saveItem, deleteItem}