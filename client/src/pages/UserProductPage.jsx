import mockCurrentUser from "../data/mockUsers";
import mockProducts from "../data/mockProducts";

function UserProductPage() {
  const myProducts = mockProducts.filter(
    (product) => product.giverId === mockCurrentUser.id,
  );
  return (
    <div>
      <h1>Xin chào, {mockCurrentUser.fullname}</h1>
    </div>
  );
}

export default UserProductPage;
