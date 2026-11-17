/**
 * @role: pages — 어드민 예매·좌석
 * @rule: 레이아웃 조합만 담당, 비즈니스 로직 포함 금지
 */
import AdminLayout from '@/widgets/Admin/Layout/ui/AdminLayout';

const AdminReservationsPage = () => {
  return (
    <AdminLayout>
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-400">준비 중</p>
      </div>
    </AdminLayout>
  );
};

export default AdminReservationsPage;
