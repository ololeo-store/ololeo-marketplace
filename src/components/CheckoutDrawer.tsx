import { X, Plus, Minus, Trash2, User, FileText, ReceiptText, ShoppingBag, ArrowLeft, Calendar, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { CartItem } from "@/store/useCart";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  title: string;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
  showAddMore?: boolean;
}
export default function CheckoutDrawer({ 
  isOpen, 
  onClose, 
  items, 
  title, 
  onUpdateQuantity, 
  onRemoveItem,
  showAddMore = false
}: CheckoutDrawerProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState(false);
  const [whatsappError, setWhatsappError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const whatsappInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLButtonElement>(null);
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
  useEffect(() => {
    if (customerName.trim() && nameError) {
      setNameError(false);
    }
  }, [customerName, nameError]);
  useEffect(() => {
    if (customerWhatsapp.trim() && whatsappError) {
      setWhatsappError(false);
    }
  }, [customerWhatsapp, whatsappError]);
  useEffect(() => {
    if (pickupDate && dateError) {
      setDateError(false);
    }
  }, [pickupDate, dateError]);
  const handleCheckout = () => {
    if (items.length === 0) return;
    
    let hasError = false;
    if (!customerName.trim()) {
      setNameError(true);
      nameInputRef.current?.focus();
      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      hasError = true;
    }
    if (!customerWhatsapp.trim()) {
      setWhatsappError(true);
      if (!hasError) {
        whatsappInputRef.current?.focus();
        whatsappInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      hasError = true;
    }
    if (!pickupDate) {
      setDateError(true);
      if (!hasError) {
        dateInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      hasError = true;
    }
    if (hasError) return;
    
    const formattedDate = pickupDate ? pickupDate.toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    }) : "";
    let message = `*𐙚 Halo, ololeo bucket*\n\n`;
    message += `Saya ingin pesan bucket\n`;
    message += `────୨ৎ──── \n`;
    message += `*Atas Nama:* ${customerName}\n`;
    message += `*WhatsApp:* ${customerWhatsapp}\n`;
    if (formattedDate) message += `*Tanggal Pengambilan:* ${formattedDate}\n`;
    if (notes) message += `*Notes:* ${notes}\n`;
    message += `────୨ৎ────\n`;
    message += `\n*𑣲 Pesanan*:\n`;
    items.forEach(item => {
      message += `- ${item.name} (x${item.quantity})\n`;
      message += `  Rp ${(item.price * item.quantity).toLocaleString("id-ID")}\n`;
    });
    message += `\n*╰┈➤ˎˊ˗ Total : Rp ${totalPrice.toLocaleString("id-ID")}*\n\nApakah pesanan ini masih tersedia?`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6288809482113?text=${encodedMessage}`, "_blank");
  };
  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div 
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full md:max-w-2xl lg:max-w-4xl bg-[#fdf2f8] shadow-2xl z-[70] transform transition-transform duration-500 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 border-b flex items-center justify-between bg-white dark:bg-card">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            {title}
          </h2>
          <button onClick={onClose} className="p-2.5 text-gray-400 dark:text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-muted-foreground space-y-4">
              <div className="w-24 h-24 bg-white dark:bg-card rounded-full flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-12 h-12 opacity-20" />
              </div>
              <p className="text-lg font-medium">Keranjang Anda masih kosong</p>
              <Link 
                href="/shop" 
                onClick={onClose}
                className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Product List Section */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Produk Pilihan</h3>
                  {showAddMore && (
                    <Link 
                      href="/shop" 
                      onClick={onClose}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Tambah Produk Lain
                    </Link>
                  )}
                </div>
                
                {items.map((item) => (
                  <div key={item.id} className="group flex gap-4 p-4 bg-white dark:bg-card rounded-3xl shadow-sm border border-pink-100 dark:border-primary/20 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-gray-100 dark:border-border">
                      <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-800 dark:text-foreground text-lg line-clamp-1">{item.name}</h4>
                          {onRemoveItem && (
                            <button 
                              onClick={() => onRemoveItem(item.id)}
                              className="p-2 text-gray-300 dark:text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                              title="Hapus item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <p className="text-secondary font-bold">
                          <span translate="no">Rp {item.price.toLocaleString("id-ID")}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-muted self-start p-1.5 rounded-xl border border-gray-100 dark:border-border">
                        <button 
                          onClick={() => onUpdateQuantity?.(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-card text-gray-500 dark:text-muted-foreground hover:text-primary hover:shadow-sm transition-all shadow-sm disabled:opacity-30"
                          disabled={!onUpdateQuantity}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center text-gray-700 dark:text-muted-foreground">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-card text-gray-500 dark:text-muted-foreground hover:text-primary hover:shadow-sm transition-all shadow-sm disabled:opacity-30"
                          disabled={!onUpdateQuantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-6 space-y-5">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Informasi Pemesanan</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <User className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                        nameError ? "text-red-400 dark:text-red-400" : "text-primary/40"
                      )} />
                      <input 
                        ref={nameInputRef}
                        type="text" 
                        placeholder="Nama Pemesan"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={cn(
                          "w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-card border-2 outline-none transition-all font-medium text-gray-700 dark:text-muted-foreground shadow-sm",
                          nameError 
                            ? "border-red-400 focus:border-red-500 ring-4 ring-red-50" 
                            : "border-pink-50 dark:border-primary/20 focus:border-primary/30"
                        )}
                      />
                      {nameError && (
                        <p className="text-red-500 dark:text-red-400 text-[10px] font-bold mt-1 ml-4 uppercase tracking-wider">Silakan isi nama Anda</p>
                      )}
                    </div>

                    <div className="relative">
                      <Phone className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                        whatsappError ? "text-red-400 dark:text-red-400" : "text-primary/40"
                      )} />
                      <input 
                        ref={whatsappInputRef}
                        type="tel" 
                        placeholder="Nomor WhatsApp (Wajib)"
                        value={customerWhatsapp}
                        onChange={(e) => setCustomerWhatsapp(e.target.value)}
                        className={cn(
                          "w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-card border-2 outline-none transition-all font-medium text-gray-700 dark:text-muted-foreground shadow-sm",
                          whatsappError 
                            ? "border-red-400 focus:border-red-500 ring-4 ring-red-50" 
                            : "border-pink-50 dark:border-primary/20 focus:border-primary/30"
                        )}
                      />
                      {whatsappError && (
                        <p className="text-red-500 dark:text-red-400 text-[10px] font-bold mt-1 ml-4 uppercase tracking-wider">Silakan isi nomor WhatsApp Anda</p>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Calendar className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none",
                        dateError ? "text-red-400 dark:text-red-400" : "text-primary/40"
                      )} />
                      <button 
                        ref={dateInputRef}
                        type="button"
                        onClick={() => setShowCalendar(true)}
                        className={cn(
                          "w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-card border-2 outline-none transition-all font-medium text-gray-700 dark:text-muted-foreground shadow-sm text-left flex items-center justify-between",
                          dateError 
                            ? "border-red-400 focus:border-red-500 ring-4 ring-red-50" 
                            : "border-pink-50 dark:border-primary/20 focus:border-primary/30"
                        )}
                      >
                        <span className={pickupDate ? "text-gray-800 dark:text-foreground" : "text-gray-400 dark:text-muted-foreground"}>
                          {pickupDate ? pickupDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Pilih Tanggal Pengambilan"}
                        </span>
                        <span className="text-[10px] text-gray-300 dark:text-muted-foreground font-bold uppercase">Ubah</span>
                      </button>
                      <input 
                        type="hidden" 
                        required={true}
                        value={pickupDate ? pickupDate.toISOString() : ""} 
                      />
                      {dateError && (
                        <p className="text-red-500 dark:text-red-400 text-[10px] font-bold mt-1 ml-4 uppercase tracking-wider">Silakan pilih tanggal pengambilan</p>
                      )}
                      {/* Aesthetic Custom Calendar */}
                      <AnimatePresence>
                        {showCalendar && (
                          <>
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setShowCalendar(false)}
                              className="fixed inset-0 bg-black/5 z-[80]"
                            />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-card rounded-3xl shadow-2xl border border-pink-50 dark:border-primary/20 p-6 z-[90] overflow-hidden"
                            >
                              <CustomCalendar 
                                selectedDate={pickupDate} 
                                onSelect={(date) => {
                                  setPickupDate(date);
                                  setShowCalendar(false);
                                }} 
                              />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="relative">
                      <FileText className="absolute left-4 top-5 w-5 h-5 text-primary/40" />
                      <textarea 
                        placeholder="Catatan tambahan (opsional) cont: Ganti warna bunga dengan biru....."
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-card border-2 border-pink-50 dark:border-primary/20 focus:border-primary/30 outline-none transition-all font-medium text-gray-700 dark:text-muted-foreground shadow-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Summary Section (Receipt Style) */}
              <div className="lg:col-span-5">
                <div className="sticky top-0">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider mb-4">Ringkasan Pesanan</h3>
                  <div className="bg-white dark:bg-card rounded-t-3xl p-8 shadow-xl relative overflow-hidden">
                    {/* Receipt Decor */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />
                    
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-pink-50 dark:bg-primary/10 text-primary mb-3">
                        <ReceiptText className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-gray-800 dark:text-foreground text-xl">OLOLEO BUCKET</h4>
                      <p className="text-xs text-gray-400 dark:text-muted-foreground mt-1 uppercase tracking-widest font-medium">Official Receipt</p>
                    </div>
                    <div className="space-y-4 font-medium text-sm text-gray-600 dark:text-muted-foreground">
                      <div className="flex justify-between border-b border-dashed border-gray-100 dark:border-border pb-2">
                        <span>Pemesan:</span>
                        <span className={cn(
                          "font-bold transition-colors",
                          nameError ? "text-red-500 dark:text-red-400" : "text-gray-900 dark:text-foreground"
                        )}>
                          <span translate="no">{customerName || "-"}</span>
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-gray-100 dark:border-border pb-2">
                        <span>WhatsApp:</span>
                        <span className={cn(
                          "font-bold transition-colors",
                          whatsappError ? "text-red-500 dark:text-red-400" : "text-gray-900 dark:text-foreground"
                        )}>
                          <span translate="no">{customerWhatsapp || "-"}</span>
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-gray-100 dark:border-border pb-2">
                        <span>Tgl Ambil:</span>
                        <span className="text-gray-900 dark:text-foreground font-bold">
                          <span key={pickupDate ? pickupDate.getTime() : "none"}>
                            {pickupDate ? pickupDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </span>
                        </span>
                      </div>
                      
                      <div className="py-2 space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span className="flex-1 pr-4">{item.name} <span className="text-primary text-xs ml-1 font-bold">x{item.quantity}</span></span>
                            <span className="text-gray-900 dark:text-foreground">
                              <span translate="no">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      {notes && (
                        <div className="pt-4 border-t border-dashed border-gray-100 dark:border-border">
                          <span className="text-xs text-gray-400 dark:text-muted-foreground block mb-1">Catatan:</span>
                          <p className="text-gray-800 dark:text-foreground text-xs italic bg-gray-50 dark:bg-muted p-3 rounded-xl border border-gray-100 dark:border-border">"{notes}"</p>
                        </div>
                      )}
                      <div className="pt-6 mt-6 border-t-2 border-gray-100 dark:border-border flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800 dark:text-foreground">Total</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                          <span translate="no">Rp {totalPrice.toLocaleString("id-ID")}</span>
                        </span>
                      </div>
                      
                      <div className="pt-4 mt-4 border-t border-dashed border-gray-100 dark:border-border italic text-[10px] text-gray-400 dark:text-muted-foreground text-center leading-relaxed">
                        Anda akan diarahkan ke WhatsApp ketika menekan tombol checkout
                      </div>
                    </div>
                    {/* Jagged edge simulation */}
                    <div className="absolute -bottom-1 left-0 right-0 flex overflow-hidden">
                       {[...Array(20)].map((_, i) => (
                         <div key={i} className="w-4 h-4 bg-[#fdf2f8] rotate-45 transform origin-top-left -mt-2" />
                       ))}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "mt-8 flex gap-3",
                    showAddMore ? "flex-row" : "flex-col"
                  )}>
                    <button 
                      onClick={handleCheckout}
                      className={cn(
                        "py-5 rounded-[2rem] bg-gradient-to-r from-primary via-[#f472b6] to-secondary text-white font-bold transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2",
                        showAddMore ? "flex-1 text-sm px-2" : "w-full text-lg"
                      )}
                    >
                      Checkout
                    </button>
                    
                    {showAddMore && (
                      <Link 
                        href="/shop" 
                        onClick={onClose}
                        className="flex-1 py-5 rounded-[2rem] border-2 border-primary/20 text-primary font-bold text-center hover:bg-primary/5 transition-all flex items-center justify-center gap-1 text-sm px-2"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Pesanan
                      </Link>
                    )}
                  </div>
                  <p className="text-center text-[10px] text-gray-400 dark:text-muted-foreground font-medium pt-4">
                    Pesanan akan diteruskan ke admin melalui WhatsApp
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
function CustomCalendar({ selectedDate, onSelect }: { selectedDate: Date | null, onSelect: (date: Date) => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthName = currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => {
    const today = new Date();
    const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (prevMonthDate.getFullYear() < today.getFullYear() || 
        (prevMonthDate.getFullYear() === today.getFullYear() && prevMonthDate.getMonth() < today.getMonth())) {
      return;
    }
    setCurrentMonth(prevMonthDate);
  };
  const isSelected = (day: number) => {
    return selectedDate && 
           selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentMonth.getMonth() && 
           selectedDate.getFullYear() === currentMonth.getFullYear();
  };
  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth.getMonth() && 
           today.getFullYear() === currentMonth.getFullYear();
  };
  const isPastDate = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return dateToCheck < today;
  };
  const todayDate = new Date();
  const isPrevMonthDisabled = currentMonth.getFullYear() < todayDate.getFullYear() || 
    (currentMonth.getFullYear() === todayDate.getFullYear() && currentMonth.getMonth() <= todayDate.getMonth());
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-bold text-gray-800 dark:text-foreground capitalize">
          <span key={monthName}>{monthName}</span>
        </h4>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth} 
            disabled={isPrevMonthDisabled}
            className="p-2 hover:bg-pink-50 dark:hover:bg-primary/10 rounded-xl transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-pink-50 dark:hover:bg-primary/10 rounded-xl transition-colors"><ChevronRight className="w-4 h-4 text-primary" /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(d => (
          <div key={d} className="text-[10px] font-bold text-gray-300 dark:text-muted-foreground text-center uppercase py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const disabled = isPastDate(day);
          return (
            <button
              key={day}
              onClick={() => !disabled && onSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
              disabled={disabled}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all relative",
                isSelected(day) 
                  ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 scale-110 z-10" 
                  : disabled
                    ? "text-gray-300 dark:text-muted-foreground cursor-not-allowed opacity-40"
                    : "text-gray-600 dark:text-muted-foreground hover:bg-pink-50 dark:hover:bg-primary/10 hover:text-primary",
                isToday(day) && !isSelected(day) && "text-primary font-bold after:content-[''] after:absolute after:bottom-1.5 after:w-1 after:h-1 after:bg-primary after:rounded-full"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
