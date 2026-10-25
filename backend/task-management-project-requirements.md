# Proje Takip Panosu

Bu proje, Trello benzeri sade bir sistemde projelerin, görevlerin ve görevlerdeki hareketlerin takip edilmesini sağlayan bir backend uygulamasıdır. Teknik uygulama kuralları için `ortak-proje-standartlari-md.md` ve starter projenin mevcut yapısı esas alınmalıdır.

## Kavram açıklamaları

- **Pano aşaması:** Görevlerin iş akışındaki yerini gösteren sütundur. Örneğin “Yapılacak”, “Devam ediyor” ve “Tamamlandı” ayrı aşamalardır.
- **Görev:** Bir proje altında tamamlanması gereken, sorumlusu ve durumu takip edilen iş parçasıdır.
- **Yapılacaklar listesi:** Bir görevi küçük adımlara bölmek için görevin altına eklenen kontrol maddeleridir.
- **Activity kaydı:** Sistemin, görevde yapılan önemli bir değişikliği otomatik olarak kaydetmesidir. Örneğin “21 Temmuz 2026, 14:30 — Ayşe, Tasarım görevinin durumunu Tamamlandı yaptı” gibi bir kayıt oluşmalıdır.
- **Arşivleme:** Projeyi silmeden kapatmak ve yeni işlem yapılmasını engellemektir. Arşivlenen proje geçmiş kayıtlarıyla birlikte görüntülenebilir kalır.

## Beklenen işlevler

- Şirket, projelerini oluşturabilmeli, düzenleyebilmeli ve tamamlanan projeleri arşivleyebilmelidir.
- Her proje için görev panosundaki çalışma aşamaları tanımlanabilmelidir. Örneğin yapılacak, devam ediyor ve tamamlandı gibi sütunlar oluşturulabilmelidir.
- Görevler bir projeye ve panodaki bir aşamaya bağlanabilmelidir.
- Göreve başlık, açıklama, öncelik, son tarih ve sorumlu kişi bilgileri eklenebilmelidir.
- Görevler oluşturulabilmeli, güncellenebilmeli, silinebilmeli ve bir aşamadan başka bir aşamaya taşınabilmelidir.
- Bir görevin altında küçük yapılacaklar listesi tutulabilmelidir. Bu maddelerin tamamlanma durumu ayrı ayrı değiştirilebilmelidir.
- Kullanıcılar görevlere yorum yazabilmelidir.
- Görevler için activity kayıtları tutulmalıdır. Örneğin bir görevin oluşturulması, sorumlusunun değişmesi, önceliğinin güncellenmesi veya durumunun `done` yapılması; zamanı ve işlemi yapan kişiyle birlikte kayda geçmelidir.
- Activity kayıtları sistem tarafından üretilmelidir; kullanıcı bunları doğrudan ekleyememeli veya değiştirememelidir.
- Projeler, görevler ve yorumlar aranabilmeli, filtrelenebilmeli ve listelenebilmelidir.
- Arşivlenmiş projelerde yeni görev veya yorum oluşturulamamalıdır.
- Bir şirketin proje ve görev verileri başka bir şirket tarafından görüntülenememeli veya değiştirilememelidir.

## Ekip içi modül dağılımı

| Kişi | Modül 1 | Modül 2 |
| --- | --- | --- |
| 1. kişi | Proje yönetimi | Pano aşamaları ve proje arşivleme |
| 2. kişi | Görev yönetimi | Görev yapılacaklar listesi ve sorumlu atama |
| 3. kişi | Görev yorumları | Sistem tarafından üretilen activity kayıtları |

## Kabul senaryoları

- Bir proje için farklı çalışma aşamaları tanımlanabilmeli ve görevler bu aşamalar arasında taşınabilmelidir.
- Bir görevin durumu değiştiğinde, işlemi yapan kişi ve işlem zamanı activity kaydında görünmelidir.
- Göreve yapılan yorumlar ve yapılacaklar listesi doğru görevle ilişkilendirilmelidir.
- Arşivlenmiş bir projede görev veya yorum eklenememelidir.
- Farklı bir şirketin kullanıcısı, bu şirketin projelerine, görevlerine, yorumlarına veya activity kayıtlarına erişememelidir.
