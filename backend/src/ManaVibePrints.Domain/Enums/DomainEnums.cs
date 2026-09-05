namespace ManaVibePrints.Domain.Enums;

public enum OrderStatus
{
    Pending,
    Artwork_Approved,
    In_Production,
    Dispatched,
    Delivered,
    Cancelled
}

public enum PaymentMethod
{
    COD,
    UPI_Manual,
    Online
}

public enum PaymentStatus
{
    Pending,
    Paid,
    Refunded
}

public enum AdminRole
{
    SuperAdmin,
    Operator
}
