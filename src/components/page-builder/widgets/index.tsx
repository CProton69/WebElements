import { widgetRegistry, WidgetDefinition } from "../WidgetRegistry";
import { PageElement } from "../PageBuilder1";
import {
  HeadingWidget,
  TextWidget,
  ButtonWidget,
  ImageWidget,
  VideoWidget,
  DividerWidget,
  IconWidget,
  SpacerWidget,
  HTMLWidget,
  StarRatingWidget,
  PriceTableWidget,
  SiteLogoWidget,
  BreadcrumbsWidget,
  ProductGridWidget,
} from "./BasicWidgets";
import {
  PageListWidget,
  NavigationMenuWidget,
  BreadcrumbWidget,
} from "./ThemeWidgets";
import { HeaderWidget, FooterWidget } from "./HeaderFooterWidgets";
import { ProductWidget } from "./ProductWidgets";
import {
  ContainerWidget,
  ColumnWidget,
  SectionWidget,
  FlexContainerWidget,
} from "./LayoutWidgets";
import {
  FormWidget,
  InputWidget,
  TextareaWidget,
  SelectWidget,
  CheckboxWidget,
  RadioWidget,
} from "./FormWidgets";
import {
  TabsWidget,
  AccordionWidget,
  ToggleWidget,
} from "./InteractiveWidgets";
import { ProgressWidget, CounterWidget } from "./ProgressWidgets";
import { GalleryWidget, CarouselWidget, MapWidget } from "./MediaWidgets";
import { AlertWidget, BadgeWidget, TestimonialWidget } from "./UtilityWidgets";
import { SocialIconsWidget } from "./SocialWidgets";
import {
  TwentyTwentySliderWidget,
  TwentyTwentyCarouselWidget,
} from "./ProWidgets";

// Basic Widgets
widgetRegistry.register({
  type: "heading",
  name: "Heading",
  icon: "Heading",
  category: "basic",
  description: "Add a heading title to your page",
  defaultContent: { text: "Your Heading Here", level: 2 },
  defaultStyles: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "left",
    marginBottom: "16px",
  },
  defaultProps: {},
  component: HeadingWidget,
  propertiesPanel: HeadingWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "text",
  name: "Text Editor",
  icon: "Type",
  category: "basic",
  description: "Add text content with rich editing capabilities",
  defaultContent: {
    text: "Add your text content here. You can format it, add links, and more.",
  },
  defaultStyles: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#4b5563",
    textAlign: "left",
    marginBottom: "16px",
  },
  defaultProps: {},
  component: TextWidget,
  propertiesPanel: TextWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "button",
  name: "Button",
  icon: "Square",
  category: "basic",
  description: "Add a clickable button with customizable actions",
  defaultContent: { text: "Click Me", link: { url: "", target: "_blank" } },
  defaultStyles: {
    backgroundColor: "#92003b",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "500",
    textAlign: "center",
    display: "inline-block",
    cursor: "pointer",
    border: "none",
    transition: "all 0.3s ease",
  },
  defaultProps: {
    hoverEffect: "scale",
    actionType: "link",
  },
  component: ButtonWidget,
  propertiesPanel: ButtonWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "image",
  name: "Image",
  icon: "Image",
  category: "basic",
  description: "Add images with upload, URL, or media library",
  defaultContent: {
    url: "",
    alt: "Image description",
    caption: "",
    link: { url: "", target: "_blank" },
  },
  defaultStyles: {
    maxWidth: "100%",
    height: "auto",
    borderRadius: "0",
    boxShadow: "none",
    margin: "0 auto",
  },
  defaultProps: {
    lazyLoad: true,
    lightbox: false,
  },
  component: ImageWidget,
  propertiesPanel: ImageWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "video",
  name: "Video",
  icon: "Video",
  category: "basic",
  description: "Embed videos from YouTube, Vimeo, or self-hosted",
  defaultContent: {
    url: "",
    source: "youtube",
    autoplay: false,
    controls: true,
    loop: false,
    muted: false,
  },
  defaultStyles: {
    width: "100%",
    height: "400px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  defaultProps: {
    responsive: true,
    aspectRatio: "16:9",
  },
  component: VideoWidget,
  propertiesPanel: VideoWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "divider",
  name: "Divider",
  icon: "Minus",
  category: "basic",
  description: "Add a divider line to separate content",
  defaultContent: {},
  defaultStyles: {
    height: "1px",
    backgroundColor: "#e5e7eb",
    margin: "24px 0",
    border: "none",
  },
  defaultProps: {
    style: "solid",
    thickness: "1px",
    color: "#e5e7eb",
  },
  component: DividerWidget,
  propertiesPanel: DividerWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "icon",
  name: "Icon",
  icon: "Star",
  category: "basic",
  description: "Add icons from various icon libraries",
  defaultContent: {
    name: "star",
    library: "lucide",
    size: 24,
    color: "#1f2937",
  },
  defaultStyles: {
    display: "inline-block",
    verticalAlign: "middle",
  },
  defaultProps: {
    link: { url: "", target: "_blank" },
  },
  component: IconWidget,
  propertiesPanel: IconWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "spacer",
  name: "Spacer",
  icon: "Space",
  category: "basic",
  description: "Add vertical or horizontal space between elements",
  defaultContent: {},
  defaultStyles: {
    height: "50px",
    width: "100%",
    display: "block",
  },
  defaultProps: {
    orientation: "vertical",
    size: 50,
  },
  component: SpacerWidget,
  propertiesPanel: SpacerWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "html",
  name: "HTML",
  icon: "Code",
  category: "basic",
  description: "Add custom HTML, CSS, or JavaScript code",
  defaultContent: {
    html: "<div>Custom HTML content</div>",
    css: "",
    js: "",
  },
  defaultStyles: {},
  defaultProps: {
    executeJS: false,
  },
  component: HTMLWidget,
  propertiesPanel: HTMLWidget.PropertiesPanel,
});

// Layout Widgets
widgetRegistry.register({
  type: "section",
  name: "Section",
  icon: "Layout",
  category: "basic",
  description: "Create a section with columns and layout structure",
  defaultContent: {},
  defaultStyles: {
    padding: "60px 20px",
    backgroundColor: "#ffffff",
    margin: "0 auto",
    position: "relative",
  },
  defaultProps: {
    fullWidth: true,
    stretchSection: true,
    backgroundType: "classic",
  },
  component: SectionWidget,
  propertiesPanel: SectionWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "column",
  name: "Column",
  icon: "Columns",
  category: "basic",
  description: "Add a column within a section for layout structure",
  defaultContent: {},
  defaultStyles: {
    padding: "20px",
    position: "relative",
  },
  defaultProps: {
    width: 6,
    gap: 20,
  },
  component: ColumnWidget,
  propertiesPanel: ColumnWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "container",
  name: "Container",
  icon: "Box",
  category: "basic",
  description: "Wrap elements in a container for styling and layout",
  defaultContent: {},
  defaultStyles: {
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  defaultProps: {
    flex: false,
    grid: false,
  },
  component: ContainerWidget,
  propertiesPanel: ContainerWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "flex-container",
  name: "Flex Container",
  icon: "Layout",
  category: "basic",
  description: "Create flexible layouts with advanced flexbox controls",
  defaultContent: {},
  defaultStyles: {
    padding: "16px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    minHeight: "100px",
  },
  defaultProps: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    alignItems: "stretch",
    alignContent: "stretch",
    gap: "0px",
    fullWidth: false,
    allowOverflow: false,
    responsive: {
      tablet: {},
      mobile: {},
    },
  },
  component: FlexContainerWidget,
  propertiesPanel: FlexContainerWidget.PropertiesPanel,
});

// Form Widgets
widgetRegistry.register({
  type: "form",
  name: "Form",
  icon: "FileText",
  category: "forms",
  description: "Create a contact or data collection form",
  defaultContent: {
    title: "Contact Form",
    description: "Fill out the form below",
    submitText: "Submit",
    action: "",
    method: "post",
  },
  defaultStyles: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  defaultProps: {
    multiStep: false,
    conditionalLogic: false,
  },
  component: FormWidget,
  propertiesPanel: FormWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "input",
  name: "Input Field",
  icon: "Input",
  category: "forms",
  description: "Add a text input field for forms",
  defaultContent: {
    label: "Name",
    placeholder: "Enter your name",
    required: false,
    type: "text",
  },
  defaultStyles: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "16px",
    marginBottom: "16px",
  },
  defaultProps: {
    validation: "none",
  },
  component: InputWidget,
  propertiesPanel: InputWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "textarea",
  name: "Textarea",
  icon: "MessageSquare",
  category: "forms",
  description: "Add a multi-line text input field",
  defaultContent: {
    label: "Message",
    placeholder: "Enter your message",
    required: false,
    rows: 4,
  },
  defaultStyles: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "16px",
    marginBottom: "16px",
    resize: "vertical",
  },
  defaultProps: {
    maxLength: 1000,
  },
  component: TextareaWidget,
  propertiesPanel: TextareaWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "select",
  name: "Select Dropdown",
  icon: "ChevronDown",
  category: "forms",
  description: "Add a dropdown select field",
  defaultContent: {
    label: "Select Option",
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
      { label: "Option 3", value: "option3" },
    ],
    required: false,
  },
  defaultStyles: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "16px",
    marginBottom: "16px",
    backgroundColor: "#ffffff",
  },
  defaultProps: {
    multiple: false,
  },
  component: SelectWidget,
  propertiesPanel: SelectWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "checkbox",
  name: "Checkbox",
  icon: "CheckSquare",
  category: "forms",
  description: "Add a checkbox for form selections",
  defaultContent: {
    label: "I agree to the terms",
    checked: false,
    required: false,
  },
  defaultStyles: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
    fontSize: "16px",
  },
  defaultProps: {
    inline: false,
  },
  component: CheckboxWidget,
  propertiesPanel: CheckboxWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "radio",
  name: "Radio Button",
  icon: "Circle",
  category: "forms",
  description: "Add radio buttons for single selections",
  defaultContent: {
    label: "Choose option",
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ],
    required: false,
  },
  defaultStyles: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
    fontSize: "16px",
  },
  defaultProps: {
    inline: false,
  },
  component: RadioWidget,
  propertiesPanel: RadioWidget.PropertiesPanel,
});

// Interactive Widgets
widgetRegistry.register({
  type: "tabs",
  name: "Tabs",
  icon: "Tabs",
  category: "interactive",
  description: "Create tabbed content sections",
  defaultContent: {
    tabs: [
      { title: "Tab 1", content: "Content for tab 1" },
      { title: "Tab 2", content: "Content for tab 2" },
    ],
    activeTab: 0,
  },
  defaultStyles: {
    width: "100%",
    marginBottom: "24px",
  },
  defaultProps: {
    layout: "horizontal",
    animation: "fade",
  },
  component: TabsWidget,
  propertiesPanel: TabsWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "accordion",
  name: "Accordion",
  icon: "ChevronDown",
  category: "interactive",
  description: "Create collapsible accordion sections",
  defaultContent: {
    items: [
      { title: "Item 1", content: "Content for item 1", open: false },
      { title: "Item 2", content: "Content for item 2", open: false },
    ],
  },
  defaultStyles: {
    width: "100%",
    marginBottom: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  defaultProps: {
    multipleOpen: false,
    animation: "slide",
  },
  component: AccordionWidget,
  propertiesPanel: AccordionWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "toggle",
  name: "Toggle",
  icon: "ToggleLeft",
  category: "interactive",
  description: "Add a toggle switch for on/off states",
  defaultContent: {
    label: "Enable feature",
    checked: false,
  },
  defaultStyles: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
    fontSize: "16px",
  },
  defaultProps: {
    size: "medium",
  },
  component: ToggleWidget,
  propertiesPanel: ToggleWidget.PropertiesPanel,
});

// Progress & Data Widgets
widgetRegistry.register({
  type: "progress",
  name: "Progress Bar",
  icon: "BarChart",
  category: "basic",
  description: "Show progress with animated bars",
  defaultContent: {
    value: 65,
    max: 100,
    showPercentage: true,
    label: "Progress",
  },
  defaultStyles: {
    width: "100%",
    height: "20px",
    backgroundColor: "#f3f4f6",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "16px",
  },
  defaultProps: {
    animated: true,
    striped: false,
  },
  component: ProgressWidget,
  propertiesPanel: ProgressWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "counter",
  name: "Counter",
  icon: "Hash",
  category: "basic",
  description: "Animated number counter",
  defaultContent: {
    value: 1000,
    prefix: "",
    suffix: "",
    duration: 2000,
    label: "Happy Customers",
  },
  defaultStyles: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#92003b",
    textAlign: "center",
    marginBottom: "16px",
  },
  defaultProps: {
    format: "number",
    decimals: 0,
  },
  component: CounterWidget,
  propertiesPanel: CounterWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "social-icons",
  name: "Social Icons",
  icon: "Share2",
  category: "basic",
  description: "Add social media icon links",
  defaultContent: {
    icons: [
      { platform: "facebook", url: "https://facebook.com", color: "#1877f2" },
      { platform: "twitter", url: "https://twitter.com", color: "#1da1f2" },
      { platform: "instagram", url: "https://instagram.com", color: "#e4405f" },
    ],
  },
  defaultStyles: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    marginBottom: "24px",
  },
  defaultProps: {
    size: 24,
    shape: "circle",
    hoverEffect: "scale",
  },
  component: SocialIconsWidget,
  propertiesPanel: SocialIconsWidget.PropertiesPanel,
});

// Media Widgets
widgetRegistry.register({
  type: "gallery",
  name: "Image Gallery",
  icon: "Images",
  category: "media",
  description: "Create image galleries with various layouts",
  defaultContent: {
    images: [],
    layout: "grid",
    columns: 3,
    spacing: 10,
  },
  defaultStyles: {
    width: "100%",
    marginBottom: "24px",
  },
  defaultProps: {
    lightbox: true,
    lazyLoad: true,
    showCaptions: false,
  },
  component: GalleryWidget,
  propertiesPanel: GalleryWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "carousel",
  name: "Image Carousel",
  icon: "Slideshow",
  category: "media",
  description: "Create sliding image carousels",
  defaultContent: {
    images: [],
    autoplay: false,
    interval: 5000,
    showDots: true,
    showArrows: true,
  },
  defaultStyles: {
    width: "100%",
    height: "400px",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "24px",
  },
  defaultProps: {
    animation: "slide",
    infinite: true,
  },
  component: CarouselWidget,
  propertiesPanel: CarouselWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "map",
  name: "Google Maps",
  icon: "MapPin",
  category: "media",
  description: "Embed Google Maps with custom markers",
  defaultContent: {
    address: "",
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 14,
    markerTitle: "Our Location",
  },
  defaultStyles: {
    width: "100%",
    height: "400px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  defaultProps: {
    mapType: "roadmap",
    showControls: true,
  },
  component: MapWidget,
  propertiesPanel: MapWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "testimonial",
  name: "Testimonial",
  icon: "MessageCircle",
  category: "basic",
  description: "Display customer testimonials",
  defaultContent: {
    quote: "This is an amazing product!",
    author: "John Doe",
    role: "CEO, Company",
    image: "",
    rating: 5,
  },
  defaultStyles: {
    padding: "30px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "24px",
  },
  defaultProps: {
    showImage: true,
    showRating: true,
  },
  component: TestimonialWidget,
  propertiesPanel: TestimonialWidget.PropertiesPanel,
});

// Utility Widgets
widgetRegistry.register({
  type: "alert",
  name: "Alert",
  icon: "AlertTriangle",
  category: "basic",
  description: "Show important messages or notifications",
  defaultContent: {
    message: "This is an important message",
    type: "info",
    dismissible: false,
  },
  defaultStyles: {
    padding: "16px",
    borderRadius: "6px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  defaultProps: {
    icon: true,
    animation: "none",
  },
  component: AlertWidget,
  propertiesPanel: AlertWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "badge",
  name: "Badge",
  icon: "Award",
  category: "basic",
  description: "Add small badges or labels",
  defaultContent: {
    text: "New",
    variant: "primary",
  },
  defaultStyles: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  defaultProps: {
    clickable: false,
  },
  component: BadgeWidget,
  propertiesPanel: BadgeWidget.PropertiesPanel,
});

// Pro Widgets
widgetRegistry.register({
  type: "star-rating",
  name: "Star Rating",
  icon: "Star",
  category: "pro",
  description: "Add interactive star rating system",
  defaultContent: {
    rating: 4,
    maxRating: 5,
    showValue: true,
  },
  defaultStyles: {
    textAlign: "center",
    marginBottom: "16px",
  },
  defaultProps: {
    starSize: "medium",
    interactive: false,
  },
  component: StarRatingWidget,
  propertiesPanel: StarRatingWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "price-table",
  name: "Price Table",
  icon: "DollarSign",
  category: "pro",
  description: "Create responsive pricing tables",
  defaultContent: {
    title: "Pricing Plans",
    subtitle: "Choose the perfect plan for your needs",
  },
  defaultStyles: {
    width: "100%",
    marginBottom: "24px",
  },
  defaultProps: {
    columns: 3,
    showFeaturedPlan: true,
  },
  component: PriceTableWidget,
  propertiesPanel: PriceTableWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "twentytwenty-slider",
  name: "TwentyTwenty Slider",
  icon: "Sliders",
  category: "pro",
  description: "Interactive before/after image comparison slider",
  defaultContent: {
    title: "Before & After Comparison",
    subtitle: "Drag the slider to see the difference",
    beforeImage: "",
    afterImage: "",
    initialPosition: 50,
  },
  defaultStyles: {
    width: "100%",
    marginBottom: "24px",
  },
  defaultProps: {
    height: "384px",
    showLabels: true,
  },
  component: TwentyTwentySliderWidget,
  propertiesPanel: TwentyTwentySliderWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "twentytwenty-carousel",
  name: "TwentyTwenty Carousel",
  icon: "Carousel",
  category: "pro",
  description: "Multiple before/after comparisons with thumbnail navigation",
  defaultContent: {
    slides: [],
    currentSlide: 0,
  },
  defaultStyles: {
    width: "100%",
    marginBottom: "24px",
  },
  defaultProps: {
    height: "384px",
    showThumbnails: true,
    showArrows: true,
    autoplay: false,
  },
  component: TwentyTwentyCarouselWidget,
  propertiesPanel: TwentyTwentyCarouselWidget.PropertiesPanel,
});

// Theme Widgets
widgetRegistry.register({
  type: "site-logo",
  name: "Site Logo",
  icon: "Image",
  category: "theme",
  description: "Display your site logo and title",
  defaultContent: {
    siteTitle: "My Website",
    logoUrl: "",
  },
  defaultStyles: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  defaultProps: {
    logoSize: "medium",
    showTitle: true,
  },
  component: SiteLogoWidget,
  propertiesPanel: SiteLogoWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "breadcrumbs",
  name: "Breadcrumbs",
  icon: "Breadcrumb",
  category: "theme",
  description: "Show navigation breadcrumbs",
  defaultContent: {
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Current Page", url: "", active: true },
    ],
  },
  defaultStyles: {
    marginBottom: "16px",
  },
  defaultProps: {
    separator: "/",
    homeLabel: "Home",
    showCurrentPage: true,
  },
  component: BreadcrumbsWidget,
  propertiesPanel: BreadcrumbsWidget.PropertiesPanel,
});

// WooCommerce Widgets
widgetRegistry.register({
  type: "product-grid",
  name: "Product Grid",
  icon: "ShoppingBag",
  category: "woocommerce",
  description: "Display WooCommerce products in a grid layout",
  defaultContent: {
    products: [
      {
        id: 1,
        name: "Sample Product 1",
        price: "$29.99",
        image: "",
        description: "This is a sample product description",
        onSale: false,
        salePrice: "",
      },
    ],
  },
  defaultStyles: {
    width: "100%",
    marginBottom: "24px",
  },
  defaultProps: {
    columns: 3,
    productCount: 6,
    showSaleBadge: true,
    showAddToCart: true,
  },
  component: ProductGridWidget,
  propertiesPanel: ProductGridWidget.PropertiesPanel,
});

// Theme Widgets
widgetRegistry.register({
  type: "page-list",
  name: "Page List",
  icon: "FileText",
  category: "theme",
  description: "Display a list of website pages with navigation",
  defaultContent: {
    showExcerpt: false,
    showDate: false,
    showIcon: true,
    openInNewTab: false,
  },
  defaultStyles: {
    marginBottom: "24px",
  },
  defaultProps: {},
  component: PageListWidget,
  propertiesPanel: PageListWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "navigation-menu",
  name: "Navigation Menu",
  icon: "Menu",
  category: "theme",
  description: "Display a navigation menu from the menus manager",
  defaultContent: {
    menuId: "",
    showTitle: false,
  },
  defaultStyles: {
    marginBottom: "24px",
  },
  defaultProps: {},
  component: NavigationMenuWidget,
  propertiesPanel: NavigationMenuWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "breadcrumb",
  name: "Breadcrumb",
  icon: "ChevronRight",
  category: "theme",
  description: "Display breadcrumb navigation for the current page",
  defaultContent: {},
  defaultStyles: {
    marginBottom: "16px",
  },
  defaultProps: {},
  component: BreadcrumbWidget,
  propertiesPanel: BreadcrumbWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "header",
  name: "Header",
  icon: "Layout",
  category: "theme",
  description: "Website header with logo, navigation, and contact info",
  defaultContent: {
    siteTitle: "Your Site",
    logoUrl: "",
    showContact: false,
    phone: "",
    email: "",
  },
  defaultStyles: {
    width: "100%",
    position: "relative",
  },
  defaultProps: {},
  component: HeaderWidget,
  propertiesPanel: HeaderWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "footer",
  name: "Footer",
  icon: "Layout",
  category: "theme",
  description: "Website footer with links, contact info, and newsletter",
  defaultContent: {
    copyright: "Your Company",
    showAbout: false,
    aboutText: "",
    socialLinks: false,
    showContact: false,
    address: "",
    phone: "",
    email: "",
    showNewsletter: false,
  },
  defaultStyles: {
    width: "100%",
    marginTop: "auto",
  },
  defaultProps: {},
  component: FooterWidget,
  propertiesPanel: FooterWidget.PropertiesPanel,
});

widgetRegistry.register({
  type: "product",
  name: "Product",
  icon: "ShoppingBag",
  category: "woocommerce",
  description: "Display a single product with image, details, and add to cart",
  defaultContent: {
    name: "Sample Product",
    price: "$29.99",
    image: "",
    description: "This is a sample product description.",
    onSale: false,
    salePrice: "",
    rating: 4.5,
    reviews: 12,
  },
  defaultStyles: {
    maxWidth: "400px",
    marginBottom: "24px",
  },
  defaultProps: {},
  component: ProductWidget,
  propertiesPanel: ProductWidget.PropertiesPanel,
});
