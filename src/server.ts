import '@/config.server';
import App from '@/app';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import CommonRoute from '@routes/common.route';

const app = new App([new IndexRoute(), new UsersRoute(), new CommonRoute()]);

app.listen();
