const BOOKS_KEY = 'BOOKSHELF_APP';
let books = JSON.parse(localStorage.getItem(BOOKS_KEY)) || [];

// Simpan data buku ke localStorage
function saveBooks() {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    console.log("Data Berhasil Disimpan.");
}

// Render daftar buku
function renderBooks(searchQuery = '') {
    const incompleteBookshelf = document.getElementById('incompleteBookList');
    const completeBookshelf = document.getElementById('completeBookList');
    incompleteBookshelf.innerHTML = '';
    completeBookshelf.innerHTML = '';

    books.forEach(book => {
        if (!matchesSearchQuery(book, searchQuery)) return;

        const bookItem = createBookElement(book);
        book.isComplete ? completeBookshelf.appendChild(bookItem) : incompleteBookshelf.appendChild(bookItem);

        // Tambahkan animasi GSAP saat elemen masuk
        gsap.from(bookItem, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: "power2.out"
        });
    });
}


// Cek apakah buku sesuai dengan pencarian
function matchesSearchQuery(book, query) {
    if (!query) return true;
    const searchLower = query.toLowerCase();
    return book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.year.toString().includes(searchLower);
}

// Buat elemen buku
function createBookElement(book) {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');
    bookItem.setAttribute('data-bookid', book.id);
    bookItem.setAttribute('data-testid', 'bookItem');

    bookItem.innerHTML = `
    <h3 data-testid="bookItemTitle">${book.title}</h3>
    <p data-testid="bookItemAuthor"><strong>Penulis:</strong> ${book.author}</p>
    <p data-testid="bookItemYear"><strong>Tahun:</strong> ${book.year}</p>
    <div>
        <button class="complete" data-testid="bookItemIsCompleteButton">
            <i class="fas ${book.isComplete ? 'fa-rotate-left' : 'fa-check'}"></i>
        </button>
        <button class="edit" data-testid="bookItemEditButton" title="Edit">
            <i class="fas fa-pen"></i>
        </button>
        <button class="delete" data-testid="bookItemDeleteButton" title="Hapus">
            <i class="fas fa-trash"></i>
        </button>
    </div>
`;


    bookItem.querySelector('.complete').addEventListener('click', () => toggleBookStatus(book));
    bookItem.querySelector('.delete').addEventListener('click', () => deleteBook(book.id));
    bookItem.querySelector('.edit').addEventListener('click', () => editBook(book));

    return bookItem;
}

// Ubah status buku (selesai/belum selesai)
function toggleBookStatus(book) {
    const bookElement = document.querySelector(`[data-bookid="${book.id}"]`);
    
    // Animasi keluar sebelum dipindahkan
    gsap.to(bookElement, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            book.isComplete = !book.isComplete;
            saveBooks();
            renderBooks(); // Memuat ulang daftar buku dengan animasi masuk baru
        }
    });
}

// Hapus buku
function deleteBook(bookId) {
    books = books.filter(book => book.id !== bookId);
    saveBooks();
    renderBooks();
}

// Edit buku
function editBook(book) {
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;
    document.getElementById('bookFormTitle').focus();

    const formButton = document.getElementById('bookFormSubmit');
    formButton.textContent = 'Update Buku';

    formButton.onclick = event => {
        event.preventDefault();
        book.title = document.getElementById('bookFormTitle').value.trim();
        book.author = document.getElementById('bookFormAuthor').value.trim();
        book.year = parseInt(document.getElementById('bookFormYear').value.trim(), 10);
        book.isComplete = document.getElementById('bookFormIsComplete').checked;

        saveBooks();
        renderBooks();
        resetForm();
    };
}

// Reset form setelah menambahkan atau mengedit buku
function resetForm() {
    document.getElementById('bookForm').reset();
    const formButton = document.getElementById('bookFormSubmit');
    formButton.innerHTML = "Masukkan Buku ke rak <strong>Belum selesai dibaca</strong>";
    formButton.onclick = null;
}

// Tambah buku baru
document.getElementById('bookForm').addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('bookFormTitle').value.trim();
    const author = document.getElementById('bookFormAuthor').value.trim();
    const year = parseInt(document.getElementById('bookFormYear').value.trim(), 10);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    if (!title || !author || !year) {
        alert('Mohon lengkapi semua data buku.');
        return;
    }

    books.push({
        id: new Date().getTime(),
        title,
        author,
        year,
        isComplete
    });
    saveBooks();
    renderBooks();
    resetForm();
});

// Fungsi pencarian buku
document.getElementById('searchBook').addEventListener('submit', function (event) {
    event.preventDefault();
    const searchQuery = document.getElementById('searchBookTitle').value.trim().toLowerCase();
    if (!searchQuery) {
        renderBooks();
    } else {
        renderBooks(searchQuery);
    }
});

// Update tombol saat checkbox berubah
function updateButtonLabel() {
    const formButton = document.getElementById('bookFormSubmit');
    formButton.innerHTML = document.getElementById('bookFormIsComplete').checked
        ? "Masukkan Buku ke rak <strong>Selesai dibaca</strong>"
        : "Masukkan Buku ke rak <strong>Belum selesai dibaca</strong>";
}

document.getElementById('bookFormIsComplete').addEventListener('change', updateButtonLabel);

document.addEventListener("DOMContentLoaded", () => {
    updateButtonLabel();
    renderBooks();
});

// Hapus buku dengan konfirmasi SweetAlert2
function deleteBook(bookId) {
    Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Buku yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            const bookElement = document.querySelector(`[data-bookid="${bookId}"]`);

            // Animasi keluar sebelum dihapus
            gsap.to(bookElement, {
                opacity: 0,
                scale: 0.8,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    books = books.filter(book => book.id !== bookId);
                    saveBooks();
                    renderBooks();

                    Swal.fire({
                        title: "Terhapus!",
                        text: "Buku berhasil dihapus.",
                        icon: "success"
                    });
                }
            });
        }
    });
}

