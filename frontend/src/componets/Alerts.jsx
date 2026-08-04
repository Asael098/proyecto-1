import React from "react";
import Swal from "sweetalert2";

export const DeleteAlert = () => {
    return Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    });
}

export const successAlert = (n) => {

    Swal.fire({
        title: n,
        icon: "success",
        draggable: true
    });
}