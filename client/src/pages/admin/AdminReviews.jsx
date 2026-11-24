import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import API from '../../services/api';
import { formatDate } from '../../utils/format';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reviews/admin/all');
      if (res.data?.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.warn('Could not load reviews:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/reviews/${id}/status`, { status });
      setReviews(reviews.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await API.delete(`/reviews/${id}`);
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message || 'Deletion failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Reputation & Social Proof Integrity
        </span>
        <h1 className="font-serif text-2xl font-bold text-luxury-black">
          Client Review Moderation ({reviews.length})
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Only genuine reviews submitted by verified buyers following delivered purchases can be approved for storefront display.
        </p>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-luxury-gold uppercase tracking-wider animate-pulse">
            Loading reviews...
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Footwear Product</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Review Content</th>
                  <th className="py-3 px-4">Verified Purchase</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-bold text-luxury-black max-w-xs">
                      <div className="flex items-center space-x-2">
                        {rev.product?.images?.[0] && (
                          <img
                            src={rev.product.images[0]}
                            alt=""
                            className="w-8 h-10 object-cover border border-gray-200 shrink-0"
                          />
                        )}
                        <span className="truncate">{rev.product?.name || 'Deleted Product'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-luxury-black block">{rev.userName}</span>
                      <span className="text-[10px] text-gray-400">{formatDate(rev.createdAt)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-luxury-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-luxury-gold' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <span className="font-bold text-luxury-black block">{rev.title}</span>
                      <p className="text-gray-600 line-clamp-2 mt-0.5">{rev.comment}</p>
                    </td>
                    <td className="py-3 px-4">
                      {rev.isVerifiedPurchase ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified Purchase</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Unverified</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                          rev.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rev.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {rev.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rev._id, 'approved')}
                            className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-semibold uppercase hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                        {rev.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rev._id, 'rejected')}
                            className="px-2 py-1 bg-amber-600 text-white text-[10px] font-semibold uppercase hover:bg-amber-700"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            No customer reviews logged yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
