import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '../../design-system';
import { sellerApi } from '../api/index';
import styles from './sellerPages.module.css';

export function ProductFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !id) return;
    sellerApi.products.get(id).then((p) => {
      setName(p.name);
      setDescription(p.description);
      setPrice(String(p.price));
      setIsPublished(p.isPublished);
    });
  }, [id, isNew]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        name,
        description,
        price: Number(price),
        isPublished,
      };
      if (isNew) {
        await sellerApi.products.create(body);
      } else {
        await sellerApi.products.update(id!, body);
      }
      navigate('/seller/products');
    } catch {
      setError('Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>{isNew ? 'Новый товар' : 'Редактирование'}</h1>
      <form className={styles.formGrid} onSubmit={submit}>
        <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Цена"
          type="number"
          min={0}
          step={0.01}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />{' '}
          Опубликован
        </label>
        {error && <p>{error}</p>}
        <div className={styles.rowActions}>
          <Button type="submit" loading={saving}>
            Сохранить
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/seller/products')}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
