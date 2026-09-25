-- decrement_product_stock atomically subtracts stock from a product.
-- It ensures that stock doesn't fall below zero.

CREATE OR REPLACE FUNCTION decrement_product_stock(p_id UUID, qty INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE products
    SET stock = stock - qty
    WHERE id = p_id AND stock >= qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock';
    END IF;
END;
$$;
