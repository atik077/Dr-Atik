import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  limit,
  setDoc,
  serverTimestamp,
  increment,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { Medicine, Sale, Purchase, DashboardStats, Category, Customer, CustomerTransaction, ChiefComplaint, ExaminationFinding } from '../types';

export const storageService = {
  // Chief Complaints
  getChiefComplaints: async (): Promise<ChiefComplaint[]> => {
    const path = 'chiefComplaints';
    try {
      const q = query(collection(db, path), orderBy('value'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChiefComplaint));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  saveChiefComplaint: async (complaint: Partial<ChiefComplaint>): Promise<ChiefComplaint> => {
    const path = 'chiefComplaints';
    try {
      if (complaint.id) {
        const docRef = doc(db, path, complaint.id);
        const data = { ...complaint };
        delete data.id;
        await updateDoc(docRef, data);
        return { ...complaint } as ChiefComplaint;
      } else {
        const data = {
          ...complaint,
          createdAt: new Date().toISOString()
        };
        delete (data as any).id;
        const docRef = await addDoc(collection(db, path), data);
        return { id: docRef.id, ...data } as ChiefComplaint;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  deleteChiefComplaint: async (id: string): Promise<void> => {
    const path = `chiefComplaints/${id}`;
    try {
      await deleteDoc(doc(db, 'chiefComplaints', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Examination Findings
  getExaminationFindings: async (): Promise<ExaminationFinding[]> => {
    const path = 'examinationFindings';
    try {
      const q = query(collection(db, path), orderBy('value'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExaminationFinding));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  saveExaminationFinding: async (finding: Partial<ExaminationFinding>): Promise<ExaminationFinding> => {
    const path = 'examinationFindings';
    try {
      if (finding.id) {
        const docRef = doc(db, path, finding.id);
        const data = { ...finding };
        delete data.id;
        await updateDoc(docRef, data);
        return { ...finding } as ExaminationFinding;
      } else {
        const data = {
          ...finding,
          createdAt: new Date().toISOString()
        };
        delete (data as any).id;
        const docRef = await addDoc(collection(db, path), data);
        return { id: docRef.id, ...data } as ExaminationFinding;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  deleteExaminationFinding: async (id: string): Promise<void> => {
    const path = `examinationFindings/${id}`;
    try {
      await deleteDoc(doc(db, 'examinationFindings', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const path = 'customers';
    try {
      const q = query(collection(db, path), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  saveCustomer: async (customer: Partial<Customer>): Promise<Customer> => {
    const path = 'customers';
    try {
      if (customer.id) {
        const docRef = doc(db, path, customer.id);
        const data = { ...customer };
        delete data.id;
        await updateDoc(docRef, data);
        return { ...customer } as Customer;
      } else {
        const data = {
          ...customer,
          dueBalance: customer.dueBalance || 0,
          createdAt: new Date().toISOString()
        };
        delete (data as any).id;
        const docRef = await addDoc(collection(db, path), data);
        return { id: docRef.id, ...data } as Customer;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    const path = `customers/${id}`;
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Medicines
  getMedicines: async (): Promise<Medicine[]> => {
    const path = 'medicines';
    try {
      const q = query(collection(db, path), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  saveMedicine: async (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Medicine> => {
    const path = 'medicines';
    try {
      const now = new Date().toISOString();
      if (medicine.id) {
        const docRef = doc(db, path, medicine.id);
        const data = { ...medicine, updatedAt: now };
        delete data.id;
        await updateDoc(docRef, data);
        return { ...medicine, updatedAt: now } as Medicine;
      } else {
        const data = {
          ...medicine,
          createdAt: now,
          updatedAt: now
        };
        delete (data as any).id;
        const docRef = await addDoc(collection(db, path), data);
        return { id: docRef.id, ...data } as Medicine;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  deleteMedicine: async (id: string): Promise<void> => {
    const path = `medicines/${id}`;
    try {
      await deleteDoc(doc(db, 'medicines', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Transactions
  getTransactions: async (): Promise<CustomerTransaction[]> => {
    const path = 'transactions';
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerTransaction));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  saveTransaction: async (transaction: Omit<CustomerTransaction, 'id' | 'date'>): Promise<CustomerTransaction> => {
    const path = 'transactions';
    try {
      const data = {
        ...transaction,
        date: new Date().toISOString()
      };
      delete (data as any).id;
      
      const docRef = await runTransaction(db, async (txn) => {
        const txDocRef = doc(collection(db, path));
        txn.set(txDocRef, data);

        // Update customer due balance atomically
        const customerRef = doc(db, 'customers', transaction.customerId);
        const balanceAdjustment = transaction.type === 'SALE' ? transaction.amount : -transaction.amount;
        txn.update(customerRef, {
          dueBalance: increment(balanceAdjustment)
        });

        return txDocRef;
      });

      return { id: docRef.id, ...data } as CustomerTransaction;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  // Sales
  getSales: async (): Promise<Sale[]> => {
    const path = 'sales';
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  saveSale: async (sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> => {
    const path = 'sales';
    try {
      const now = new Date().toISOString();
      const saleData = {
        ...sale,
        date: now
      };
      delete (saleData as any).id;

      const result = await runTransaction(db, async (txn) => {
        const saleRef = doc(collection(db, 'sales'));
        txn.set(saleRef, saleData);

        // Update stock for each item atomically
        for (const item of sale.items) {
          const medRef = doc(db, 'medicines', item.medicineId);
          txn.update(medRef, {
            quantity: increment(-item.quantity)
          });
        }

        // Record transaction if customer is linked
        if (sale.customerId) {
          const balanceChange = sale.paymentMethod === 'Credit' ? sale.total : (sale.dueAmount || 0);
          if (balanceChange > 0) {
            const txRef = doc(collection(db, 'transactions'));
            const txData = {
              customerId: sale.customerId,
              type: 'SALE',
              amount: balanceChange,
              paymentMethod: sale.paymentMethod,
              referenceId: saleRef.id,
              note: `Sale #${saleRef.id.slice(-6)}`,
              date: now
            };
            txn.set(txRef, txData);

            // Update customer due balance atomically
            const customerRef = doc(db, 'customers', sale.customerId);
            txn.update(customerRef, {
              dueBalance: increment(balanceChange)
            });
          }
        }
        return saleRef;
      });

      return { id: result.id, ...saleData } as Sale;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  // Purchases
  getPurchases: async (): Promise<Purchase[]> => {
    const path = 'purchases';
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  savePurchase: async (purchase: Omit<Purchase, 'id' | 'date'>): Promise<Purchase> => {
    const path = 'purchases';
    try {
      const now = new Date().toISOString();
      const purchaseData = {
        ...purchase,
        date: now
      };
      delete (purchaseData as any).id;

      await runTransaction(db, async (txn) => {
        const purchaseRef = doc(collection(db, 'purchases'));
        txn.set(purchaseRef, purchaseData);

        // Update medicine stock and price atomically
        const medRef = doc(db, 'medicines', purchase.medicineId);
        txn.update(medRef, { 
          quantity: increment(purchase.quantity),
          purchasePrice: purchase.purchasePrice
        });
      });

      const purchaseSnapshot = await getDocs(query(collection(db, 'purchases'), orderBy('date', 'desc'), limit(1)));
      const purchaseId = purchaseSnapshot.docs[0].id;

      return { id: purchaseId, ...purchaseData } as Purchase;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  // Reports/Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const medicines = await storageService.getMedicines();
      const sales = await storageService.getSales();
      
      const today = new Date().toISOString().split('T')[0];
      const todaysSales = sales.filter(s => s.date.startsWith(today));
      
      const totalSales = todaysSales.reduce((acc, s) => acc + s.total, 0);
      
      const totalProfit = todaysSales.reduce((acc, s) => {
        return acc + s.items.reduce((itemAcc, item) => {
          const med = medicines.find(m => m.id === item.medicineId);
          const margin = med ? (item.pricePerUnit - med.purchasePrice) : 0;
          return itemAcc + (margin * item.quantity);
        }, 0);
      }, 0);

      const lowStockCount = medicines.filter(m => m.quantity < 10).length;
      const expiredCount = medicines.filter(m => new Date(m.expiryDate) < new Date()).length;

      return {
        totalSales,
        totalProfit,
        lowStockCount,
        expiredCount,
        recentSales: sales.slice(0, 5)
      };
    } catch (error) {
      console.error("Error generating dashboard stats:", error);
      return {
        totalSales: 0,
        totalProfit: 0,
        lowStockCount: 0,
        expiredCount: 0,
        recentSales: []
      };
    }
  },

  // Prescription Drafts
  getPrescriptionDraft: async (id: string): Promise<any | null> => {
    const path = `prescriptionDrafts/${id}`;
    try {
      const docRef = doc(db, 'prescriptionDrafts', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  savePrescriptionDraft: async (id: string, data: any): Promise<void> => {
    const path = `prescriptionDrafts/${id}`;
    try {
      const docRef = doc(db, 'prescriptionDrafts', id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: false }); // Overwrite completely as per user request
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }
};

