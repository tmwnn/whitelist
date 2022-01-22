import {collection, deleteDoc, doc, getDocs, getDoc, getFirestore, setDoc} from "firebase/firestore";

const getItems = async () => {
    let items = await getDocs(collection(getFirestore(), "items"));
    let result = [];
    await items.forEach((row) => {
        result.push(row.data());
    });
    result.sort(function(a, b) {
        return parseInt(b.created_at) - parseInt(a.created_at);
    });
    return result;
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

const getReviews = async (itemId) => {
    let reviews = await getDocs(collection(getFirestore(), "reviews"));
    let result = [];
    await reviews.forEach((item) => {
        let review = item.data();
        if (review.item_id == itemId) {
            result.push(review);
        }
    });
    result.sort(function(a, b) {
        return parseInt(b.created_at) - parseInt(a.created_at);
    });
    return result;
}

const getReview = async (id) => {
    let review = await getDoc(doc(getFirestore(), "reviews", id));
    return review.data();
}

const recalcRating = async (itemId) => {
    let reviews = await getReviews(itemId);
    let summRatings = 0;
    let cntRatings = 0;
    reviews.forEach((review) => {
       if (review.rating) {
           cntRatings++;
           summRatings += +review.rating;
       }
    });
    let avarRating = Math.round(summRatings/cntRatings * 10) / 10;
    let item = await getItem(itemId);
    item.rating = avarRating;
    saveItem(item);
}

const saveReview = async (review) => {
    await setDoc(doc(getFirestore(), "reviews", review.id), review);
    await recalcRating(review.item_id);
}

const deleteReview = async (id) => {
    let review = getReview(id);
    await deleteDoc(doc(getFirestore(), "reviews", id));
    await recalcRating(review.item_id);
}

export {getItems, getItem, saveItem, deleteItem, getReviews, saveReview, deleteReview}