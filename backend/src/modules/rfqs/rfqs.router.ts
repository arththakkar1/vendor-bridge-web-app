import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createRfqSchema } from './rfqs.schema';
import * as ctrl from './rfqs.controller';
import multer from 'multer';
import { db } from '../../config/database';
import { logAction } from '../../services/audit.service';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', authorize(['ADMIN', 'OFFICER']), validate(createRfqSchema), ctrl.create);
router.patch('/:id', authorize(['ADMIN', 'OFFICER']), ctrl.update);
router.post('/:id/publish', authorize(['ADMIN', 'OFFICER']), ctrl.publish);

// File attachment upload — multer stores files in uploads/ directory
const upload = multer({ dest: 'uploads/' });

router.post(
  '/:id/attachments',
  authorize(['ADMIN', 'OFFICER']),
  upload.array('files', 10),
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded.' });
      }

      const rfq = await db.rfq.findUnique({ where: { id: req.params.id } });
      if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found.' });

      const existingPaths = rfq.attachments ? rfq.attachments.split(',') : [];
      const newPaths = files.map((f) => f.path);
      const allPaths = [...existingPaths, ...newPaths].join(',');

      const updated = await db.rfq.update({
        where: { id: req.params.id },
        data: { attachments: allPaths },
      });

      await logAction('RFQ_ATTACHMENTS_UPLOADED', `${files.length} file(s) attached to RFQ ${rfq.rfqNumber}.`, req.user!.userId);

      res.json({ success: true, rfq: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

export default router;
