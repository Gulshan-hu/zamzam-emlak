export const translations = {
  az: {
    // Header
    siteTitle: "ZamZam Əmlak",

    // Demo Page
    designSystemDemo: "Dizayn Sistemi Demo",
    componentLibrary: "ZamZam Əmlak Komponent Kitabxanası",

    // Sections
    buttons: "Düymələr",
    formInputs: "Forma Sahələri",
    badges: "Nişanlar",
    cards: "Kartlar",
    modal: "Modal",

    // Button Labels
    primarySmall: "Əsas Kiçik",
    primaryMedium: "Əsas Orta",
    primaryLarge: "Əsas Böyük",
    secondary: "İkinci",
    ghost: "Şəffaf",
    danger: "Təhlükə",
    disabled: "Qeyri-aktiv",
    openModal: "Modalı Aç",
    close: "Bağla",
    action: "Əməliyyat",

    // Form Labels
    email: "E-poçt",
    password: "Şifrə",
    withError: "Xəta ilə",
    propertyType: "Əmlak Növü",
    enterEmail: "E-poçtunuzu daxil edin",
    enterPassword: "Şifrəni daxil edin",
    fieldRequired: "Bu sahə tələb olunur",

    // Property Types
    apartment: "Mənzil",
    house: "Ev",
    land: "Torpaq",
    commercial: "Kommersiya",

    // Badges
    forSale: "Satılır",
    forRent: "İcarəyə",
    pending: "Gözləmədə",
    rejected: "Rədd edilib",

    // Cards
    basicCard: "Əsas Kart",
    basicCardDesc: "Hover effekti olmayan sadə kart",
    hoverCard: "Hover Kartı",
    hoverCardDesc: "Bu kart hover zamanı qalxır",
    propertyCard: "Əmlak Kartı",
    sampleProperty: "Nümunə əmlak elanı",
    sale: "Satış",

    // Modal
    sampleModal: "Nümunə Modal",
    modalDescription: "Bu, fon bulanıqlığı və hamar animasiyalarla modaldır.",
  },
  ru: {
    // Header
    siteTitle: "ZamZam Недвижимость",

    // Demo Page
    designSystemDemo: "Демо Дизайн-Системы",
    componentLibrary: "Библиотека Компонентов ZamZam",

    // Sections
    buttons: "Кнопки",
    formInputs: "Поля Формы",
    badges: "Значки",
    cards: "Карточки",
    modal: "Модальное Окно",

    // Button Labels
    primarySmall: "Основная Маленькая",
    primaryMedium: "Основная Средняя",
    primaryLarge: "Основная Большая",
    secondary: "Вторичная",
    ghost: "Прозрачная",
    danger: "Опасность",
    disabled: "Неактивная",
    openModal: "Открыть Модальное Окно",
    close: "Закрыть",
    action: "Действие",

    // Form Labels
    email: "Эл. почта",
    password: "Пароль",
    withError: "С ошибкой",
    propertyType: "Тип Недвижимости",
    enterEmail: "Введите вашу почту",
    enterPassword: "Введите пароль",
    fieldRequired: "Это поле обязательно",

    // Property Types
    apartment: "Квартира",
    house: "Дом",
    land: "Земля",
    commercial: "Коммерческая",

    // Badges
    forSale: "Продажа",
    forRent: "Аренда",
    pending: "В ожидании",
    rejected: "Отклонено",

    // Cards
    basicCard: "Базовая Карточка",
    basicCardDesc: "Простая карточка без эффекта наведения",
    hoverCard: "Карточка с Hover",
    hoverCardDesc: "Эта карточка поднимается при наведении",
    propertyCard: "Карточка Недвижимости",
    sampleProperty: "Образец объявления",
    sale: "Продажа",

    // Modal
    sampleModal: "Пример Модального Окна",
    modalDescription: "Это модальное окно с размытием фона и плавной анимацией.",
  },
  en: {
    // Header
    siteTitle: "ZamZam Real Estate",

    // Demo Page
    designSystemDemo: "Design System Demo",
    componentLibrary: "ZamZam Component Library",

    // Sections
    buttons: "Buttons",
    formInputs: "Form Inputs",
    badges: "Badges",
    cards: "Cards",
    modal: "Modal",

    // Button Labels
    primarySmall: "Primary Small",
    primaryMedium: "Primary Medium",
    primaryLarge: "Primary Large",
    secondary: "Secondary",
    ghost: "Ghost",
    danger: "Danger",
    disabled: "Disabled",
    openModal: "Open Modal",
    close: "Close",
    action: "Action",

    // Form Labels
    email: "Email",
    password: "Password",
    withError: "With Error",
    propertyType: "Property Type",
    enterEmail: "Enter your email",
    enterPassword: "Enter password",
    fieldRequired: "This field is required",

    // Property Types
    apartment: "Apartment",
    house: "House",
    land: "Land",
    commercial: "Commercial",

    // Badges
    forSale: "For Sale",
    forRent: "For Rent",
    pending: "Pending",
    rejected: "Rejected",

    // Cards
    basicCard: "Basic Card",
    basicCardDesc: "A simple card without hover effect",
    hoverCard: "Hover Card",
    hoverCardDesc: "This card lifts on hover",
    propertyCard: "Property Card",
    sampleProperty: "Sample property listing",
    sale: "Sale",

    // Modal
    sampleModal: "Sample Modal",
    modalDescription: "This is a modal with backdrop blur and smooth animations.",
  },
} as const;

export type TranslationKeys = keyof typeof translations.az;
