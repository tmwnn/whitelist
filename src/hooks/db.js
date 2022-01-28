import {collection, deleteDoc, doc, getDocs, getDoc, getFirestore, setDoc, query, where, orderBy} from "firebase/firestore";

const getItems = async () => {
    const items = await getDocs(query(
        collection(getFirestore(), "items"),
        orderBy("created_at", "desc")
    ));
    let result = [];
    items.forEach((row) => {
        result.push(row.data());
    });
    result.sort((a, b) => +b.rating - +a.rating);
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
    let result = [];
    const reviews = await getDocs(query(
        collection(getFirestore(), "reviews"),
        where('item_id','==', itemId),
        orderBy("created_at", "desc")
    ));
    reviews.forEach((item) => {
        result.push(item.data());
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
    let review = await getReview(id);
    await deleteDoc(doc(getFirestore(), "reviews", id));
    await recalcRating(review.item_id);
}

const getCategories = async (onlyExitst) => {
    let categories = [];
    if (!onlyExitst) {
        categories = ['', 'Кафе/бар', 'Автосервис', 'Стоматология', 'Ветклиника'];
    }
    let items = await getItems();
    items.forEach((item) => {
        if (!!item.category && !categories.includes(item.category)) {
            categories.push(item.category);
        }
    });
    return categories;
}

export {getItems, getItem, saveItem, deleteItem, getReviews, saveReview, deleteReview, getCategories}
